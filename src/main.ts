// Polyfill for graph client
import { Client } from '@microsoft/microsoft-graph-client'
import { ClientCredentialsAuthProvider } from './auth'; const core = require('@actions/core')
const fs = require('fs')
const path = require('path')
const fsPromises = require('fs').promises;
(global as any).fetch = require('node-fetch')
const Readable = require('stream').Readable
const fg = require('fast-glob')

// XML parsing
const { DOMParser } = require('xmldom')

enum DeploymentType {
  All,
  CommaDelimiter,
  JSON
}

class Settings {
  public folder: string = ''
  files: any
  tenant: string = ''
  clientId: string = ''
  clientSecret: string = ''
  addAppInsightsStep: boolean = false
  renumberSteps: boolean = false
  verbose: boolean = false
}

async function run(): Promise<void> {

  const settings: Settings = new Settings()
  try {
    settings.folder = core.getInput('folder')
    settings.files = core.getInput('files')
    settings.tenant = core.getInput('tenant')
    settings.clientId = core.getInput('clientId')
    settings.clientSecret = core.getInput('clientSecret')
    settings.addAppInsightsStep = core.getInput('addAppInsightsStep')  === true || core.getInput('addAppInsightsStep') === 'true'
    settings.renumberSteps = core.getInput('renumberSteps')  === true || core.getInput('renumberSteps') === 'true'
    settings.verbose = core.getInput('verbose')  === true || core.getInput('verbose') === 'true'
    let deploymentType: DeploymentType

    core.info('Deploy custom policy GitHub Action v5.3 started.')

    if (settings.clientId === 'test') {
      core.info('GitHub Action test successfully completed.')
      return
    }

    if (settings.clientId === '') {
      core.setFailed("The 'clientId' parameter is missing.")
    }

    if (settings.folder === '') {
      core.setFailed("The 'folder' parameter is missing.")
    }

    if (settings.files === '') {
      core.setFailed("The 'files' parameter is missing.")
    }

    if (settings.tenant === '') {
      core.setFailed("The 'tenant' parameter is missing.")
    }

    if (settings.clientSecret === ''
    ) {
      core.setFailed(`The 'clientSecret' parameter is missing.`)
    }

    // Print the input parameters
    if (settings.verbose)
      core.info(JSON.stringify(settings))

    // Create OAuth2 client
    const client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        settings.tenant,
        settings.clientId,
        settings.clientSecret
      ),
      defaultVersion: 'beta'
    })

    // Create an array of policy files
    let filesArray = settings.files.split(",")

    if (settings.files === "*") {
      deploymentType = DeploymentType.All
      filesArray = await fg([`${settings.folder}/**/*.xml`], { dot: true })
    }
    else if (settings.files.indexOf(".json") > 0) {
      deploymentType = DeploymentType.JSON
      if (!fs.existsSync(`.github/workflows/${settings.files}`)) {
        core.setFailed(`Can't find the .github/workflows/${settings.files} file`)
      }

      const deploymentFile = fs.readFileSync(`.github/workflows/${settings.files}`);
      const deploymentJson = JSON.parse(deploymentFile);

      filesArray = deploymentJson.files
    }
    else {
      deploymentType = DeploymentType.CommaDelimiter
    }

    core.info(`Deployment type: ${DeploymentType[deploymentType]}.`)

    for (const f of filesArray) {

      let filePath = ''

      if (deploymentType === DeploymentType.All) {
        filePath = f.trim()
      }
      else if (deploymentType === DeploymentType.JSON) {
        filePath = path.join(settings.folder, f.path.trim())
      }
      else if (deploymentType === DeploymentType.CommaDelimiter) {
        filePath = path.join(settings.folder, f.trim())
      }

      if (filePath.length > 0 && fs.existsSync(filePath)) {

        // Get the policy name
        let policyName = ''
        const policyFile = await fsPromises.readFile(filePath)
        let policyXML = policyFile.toString()

        const result = policyXML.match(/(?<=\bPolicyId=")[^"]*/gm)

        if (result && result.length > 0)
          policyName = result[0]

        // Replace yourtenant.onmicrosoft.com with the tenant name parameter
        if (policyXML.indexOf("yourtenant.onmicrosoft.com") > 0) {
          //core.info(`Policy ${filePath} replacing yourtenant.onmicrosoft.com with ${tenant}.`)
          policyXML = policyXML.replace(new RegExp("yourtenant.onmicrosoft.com", "gi"), settings.tenant)
        }

        // Use the deployment JSON file to find and replace in the custom policy file
        if (deploymentType === DeploymentType.JSON && f.replacements !== undefined) {
          for (const r of f.replacements) {
            policyXML = policyXML.replace(new RegExp(r.find, "gi"), r.replace)
          }
        }

        // Add Azure AppInsights orchestration step at the begging of the collection
        if (settings.addAppInsightsStep) {
          policyXML = addAppInsightsOrchestrationStep(policyXML)
        }

        // Renumber the orchestration steps
        if (settings.renumberSteps) {
          policyXML = renumberOrchestrationSteps(policyXML)
        }

        if (settings.verbose)
          core.info(policyXML)

        const fileStream = new Readable()
        fileStream.push(policyXML)
        fileStream.push(null)      // Indicates end of file/stream

        // Upload the policy
        const response = await client
          .api(`trustFramework/policies/${policyName}/$value`)
          .putStream(fileStream)

        core.info(`Policy ${filePath} successfully uploaded.`)
      }
      else {
        core.warning(`Policy ${filePath} not found.`)
      }
    }

  } catch (error: any) {
    const errorText = error.message ?? error
    core.setFailed(errorText)
  }
}

function addAppInsightsOrchestrationStep(xmlStringDocument: string) {

  const xmlDoc = new DOMParser().parseFromString(xmlStringDocument, "application/xml")


  const UserJourneys = xmlDoc.getElementsByTagName("UserJourney")

  // Iterate through all user journeys
  for (let uj = 0; uj < UserJourneys.length; uj++) {
    const ParentOrchestrationSteps = UserJourneys[uj].getElementsByTagName("OrchestrationSteps")

    //<OrchestrationStep Order="1" Type="ClaimsExchange"><ClaimsExchanges><ClaimsExchange Id="AppInsights-Start" TechnicalProfileReferenceId="AppInsights-Start" /></ClaimsExchanges></OrchestrationStep>
    const OrchestrationStep = xmlDoc.createElement("OrchestrationStep")
    OrchestrationStep.setAttribute("Type", "ClaimsExchange")
    OrchestrationStep.setAttribute("Order", "1")

    const ClaimsExchanges = xmlDoc.createElement("ClaimsExchanges")
    const ClaimsExchange = xmlDoc.createElement("ClaimsExchange")
    ClaimsExchange.setAttribute("Id", "AppInsights-Start")
    ClaimsExchange.setAttribute("TechnicalProfileReferenceId", "AppInsights-Start")

    OrchestrationStep.appendChild(ClaimsExchanges)
    ClaimsExchanges.appendChild(ClaimsExchange)

    // There is only one OrchestrationSteps element in a UserJourney, add the new element at the first place
    ParentOrchestrationSteps[0].insertBefore(OrchestrationStep, ParentOrchestrationSteps[0].firstChild)
  }

  return xmlDoc.documentElement.toString()
}

// Renumber documents' user journeys, or sub journeys
function renumberOrchestrationSteps(xmlStringDocument: string) {

  const xmlDoc = new DOMParser().parseFromString(xmlStringDocument, "application/xml")
  const UserJourneys = xmlDoc.getElementsByTagName("UserJourney")

  for (let uj = 0; uj < UserJourneys.length; uj++) {
    const OrchestrationSteps = UserJourneys[uj].getElementsByTagName("OrchestrationStep")

    if (OrchestrationSteps !== null && OrchestrationSteps !== undefined) {
      for (let os = 0; os < OrchestrationSteps.length; os++) {
        OrchestrationSteps[os].setAttribute("Order", os + 1)
      }
    }
  }

  return xmlDoc.documentElement.toString()
}

run()



// import * as core from '@actions/core'
// import {wait} from './wait'

// async function run(): Promise<void> {
//   try {
//     const ms: string = core.getInput('milliseconds')
//     core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

//     core.debug(new Date().toTimeString())
//     await wait(parseInt(ms, 10))
//     core.debug(new Date().toTimeString())

//     core.setOutput('time', new Date().toTimeString())
//   } catch (error) {
//     core.setFailed(error.message)
//   }
// }

// run()
