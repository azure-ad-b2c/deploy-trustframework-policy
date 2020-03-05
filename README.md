# GitHub Action for deploying TrustFramework policies

Use this GitHub Action to deploy a TrustFramework Policy into your Azure Active Directory B2C tenant using the [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/resources/trustframeworkpolicy?view=graph-rest-beta). If the policy does not yet exist, it will be created. If the policy already exists, it will be replaced.

For more information on TrustFramework Policies and the Identity Experience Framework, see the [Azure AD B2C documentation](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview).

To authenticate to the Microsoft Graph, you will need to obtain client application credentials using [these instructions](https://docs.microsoft.com/en-us/azure/active-directory-b2c/microsoft-graph-get-started).

## Sample workflow to deploy TrustFramework policies

```yaml
on: push

env:
  clientId: 00000000-0000-0000-0000-000000000000
  tenant: my-tenant.onmicrosoft.com

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: 'Upload TrustFrameworkBase Policy'
      uses: azure-ad-b2c/deploy-trustframework-policy@v1
      with:
        file: "./Policies/TrustFrameworkBase.xml"
        policy: TrustFrameworkBase
        tenant: ${{ env.tenant }}
        clientId: ${{ env.clientId }}
        clientSecret: ${{ secrets.clientSecret }}

    - name: Upload TrustFrameworkExtensions Policy
      uses: azure-ad-b2c/deploy-trustframework-policy@v1
      with:
        file: "./Policies/TrustFrameworkExtensions.xml"
        policy: TrustFrameworkExtensions
        tenant: ${{ env.tenant }}
        clientId: ${{ env.clientId }}
        clientSecret: ${{ secrets.clientSecret }}

    - name: Upload SignUpOrSignin Policy
      uses: azure-ad-b2c/deploy-trustframework-policy@v1
      with:
        file: "./Policies/SignUpOrSignin.xml"
        policy: SignUpOrSignin
        tenant: ${{ env.tenant }}
        clientId: ${{ env.clientId }}
        clientSecret: ${{ secrets.clientSecret }}
```

## Community Help and Support
Use [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-ad-b2c) to get support from the community. Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before. Make sure that your questions or comments are tagged with [azure-ad-b2c].

If you find a bug in the sample, please raise the issue on [GitHub Issues](https://github.com/azure-ad-b2c/deploy-trustframework-policy/issues).

To provide product feedback, visit the Azure AD B2C [feedback page](https://feedback.azure.com/forums/169401-azure-active-directory?category_id=160596).