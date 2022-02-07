import {Client, Issuer, TokenSet} from 'openid-client'
import {AuthenticationProvider} from '@microsoft/microsoft-graph-client'

export class ClientCredentialsAuthProvider implements AuthenticationProvider {
  private static defaultScope = 'https://graph.microsoft.com/.default'

  private authClient: Promise<Client>
  private cachedToken: TokenSet | null = null

  constructor(
    tenant: string,
    private clientId: string,
    private clientSecret: string,
    private scopes = [ClientCredentialsAuthProvider.defaultScope]
  ) {
    this.authClient = Issuer.discover(
      `https://login.microsoftonline.com/${tenant}/v2.0/.well-known/openid-configuration`
    ).then(issuer => {
      const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret
      })
      return client
    })
  }

  async getAccessToken(): Promise<string> {
    if (!this.cachedToken || this.cachedToken.expired()) {
      await this.acquireNewToken()
    }

    if (!this.cachedToken?.access_token) {
      throw Error(`Failed to acquire an authentication token`)
    }

    return this.cachedToken.access_token
  }

  private async acquireNewToken(): Promise<any> {
    this.cachedToken = await (
      await this.authClient
    ).grant({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: this.scopes.join(' ')
    })
  }
}
