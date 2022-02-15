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

async function run(): Promise<void> {
  try {
    const folder = core.getInput('folder')
    const files = core.getInput('files')
    const tenant = core.getInput('tenant')
    const clientId = core.getInput('clientId')
    const clientSecret = core.getInput('clientSecret')
    const addAppInsightsStep = core.getInput('addAppInsightsStep')
    const renumberSteps = core.getInput('renumberSteps')


    core.info('Deploy custom policy GitHub Action v5.1 started.')

    if (clientId === 'test') {
      core.info('GitHub Action test successfully completed.')
      return
    }

    if (clientId === null || clientId === undefined || clientId === '') {
      core.setFailed("The 'clientId' parameter is missing.")
    }

    if (folder === null || folder === undefined || folder === '') {
      core.setFailed("The 'folder' parameter is missing.")
    }

    if (files === null || files === undefined || files === '') {
      core.setFailed("The 'files' parameter is missing.")
    }

    if (tenant === null || tenant === undefined || tenant === '') {
      core.setFailed("The 'tenant' parameter is missing.")
    }

    if (clientSecret === null || clientSecret === undefined || clientSecret === ''
    ) {
      core.setFailed(`The 'clientSecret' parameter is missing.`)
    }

    const client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        tenant,
        clientId,
        clientSecret
      ),
      defaultVersion: 'beta'
    })

    // Create an array of policy files
    let filesArray = files.split(",")

    if (files === "*") {
      filesArray = await fg([`${folder}/**/*.xml`], { dot: true })
    }

    for (const f of filesArray) {

      let filePath = ''

      if (files === "*") {
        filePath = f.trim()
      }
      else {
        filePath = path.join(folder, f.trim())
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
          policyXML = policyXML.replace(new RegExp("yourtenant.onmicrosoft.com", "gi"), tenant)
        }

        // Add Azure AppInsights orchestration step at the begging of the collection
        if (addAppInsightsStep !== null && addAppInsightsStep !== undefined || addAppInsightsStep === true) {
          policyXML = addAppInsightsOrchestrationStep(policyXML)
        }

        // Renumber the orchestration steps
        if (renumberSteps !== null && renumberSteps !== undefined || renumberSteps === true) {
          policyXML = renumberOrchestrationSteps(policyXML)
        }

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

  const ParentOrchestrationSteps = xmlDoc.getElementsByTagName("OrchestrationSteps")
  for (let i = 0; i < ParentOrchestrationSteps.length; i++) {
    //<OrchestrationStep Order="1" Type="ClaimsExchange"><ClaimsExchanges><ClaimsExchange Id="AppInsights-Start" TechnicalProfileReferenceId="AppInsights-Start" /></ClaimsExchanges></OrchestrationStep>
    const OrchestrationStep = xmlDoc.createElement("OrchestrationStep")
    OrchestrationStep.setAttribute("Type", "ClaimsExchange")

    const ClaimsExchanges = xmlDoc.createElement("ClaimsExchanges")
    const ClaimsExchange = xmlDoc.createElement("ClaimsExchange")
    ClaimsExchange.setAttribute("Id", "AppInsights-Start")
    ClaimsExchange.setAttribute("TechnicalProfileReferenceId", "AppInsights-Start")

    OrchestrationStep.appendChild(ClaimsExchanges)
    ClaimsExchanges.appendChild(ClaimsExchange)

    ParentOrchestrationSteps[i].insertBefore(OrchestrationStep, ParentOrchestrationSteps[i].firstChild)
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
