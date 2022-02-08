const core = require('@actions/core');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
(global as any).fetch = require('node-fetch'); // Polyfill for graph client
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientCredentialsAuthProvider } from './auth';

async function run(): Promise<void> {
  try {
    const folder = core.getInput('folder');
    const files = core.getInput('files');
    const tenant = core.getInput('tenant');
    const clientId = core.getInput('clientId');
    const clientSecret = core.getInput('clientSecret');

    core.info('Deploy custom policy GitHub Action v5b started.')

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

    let client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        tenant,
        clientId,
        clientSecret
      ),
      defaultVersion: 'beta'
    });

    // Create an array of policy files
    let filesArray = files.split(",");

    for (let f of filesArray) {

      const file: string = path.join(folder, f.trim());

      if (file.length > 0 && fs.existsSync(file)) {

        core.info('Uploading policy file ' + file + ' ...');

        // Get the policy name
        let policyName: string = '';
        const data = await fsPromises.readFile(file);

        let result = data.toString().match(/(?<=\bPolicyId=")[^"]*/gm);

        if (result && result.length > 0)
          policyName = result[0];

        // Upload the policy
        let fileStream = fs.createReadStream(file);
        let response = await client
          .api(`trustFramework/policies/${policyName}/$value`)
          .putStream(fileStream);

        core.info('Uploading policy file ' + file + ' task is completed.');
      }
      else {
        core.warning('Policy file ' + file + ' not found.')
      }
    }

  } catch (error) {
    let errorText = error.message ?? error;
    core.setFailed(errorText);
  }
}

run();



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
