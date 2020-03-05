const core = require('@actions/core');
const fs = require('fs');
(global as any).fetch = require('node-fetch'); // Polyfill for graph client
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientCredentialsAuthProvider } from './auth';

async function main() {
  try {
    const file = core.getInput('file');
    const policy = core.getInput('policy');
    const tenant = core.getInput('tenant');
    const clientId = core.getInput('clientId');
    const clientSecret = core.getInput('clientSecret');

    let client = Client.initWithMiddleware({
      authProvider: new ClientCredentialsAuthProvider(
        tenant,
        clientId,
        clientSecret
      ),
      defaultVersion: 'beta'
    });

    let fileStream = fs.createReadStream(file);
    let response = await client
      .api(`trustFramework/policies/${policy}/$value`)
      .putStream(fileStream);

    core.info('Wrote policy using Microsoft Graph: ' + response);
  } catch (error) {
    let errorText = error.message ?? error;
    core.error('Action failed: ' + errorText);
    core.setFailed();
  }
}

main();
