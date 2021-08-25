# GitHub Action for deploying Azure AD B2C custom policies

Use this GitHub Action to deploy an [Azure AD B2C custom policy](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-overview) into your Azure Active Directory B2C tenant using the [Microsoft Graph API](https://docs.microsoft.com/graph/api/resources/trustframeworkpolicy?view=graph-rest-beta). If the policy does not yet exist, it will be created. If the policy already exists, it will be replaced.

Microsoft Graph allows you to manage many of the resources within your Azure AD B2C tenant, including customer user accounts and custom policies. Before your scripts and applications can interact with the Microsoft Graph API to manage Azure AD B2C resources, you need to create an application registration in your Azure AD B2C tenant that grants the required API permissions.

To create an MS Graph application, follow these steps:

1. Follow the guidance [how to register management application](https://docs.microsoft.com/azure/active-directory-b2c/microsoft-graph-get-started).
1. Take a note on the application client ID you registered. 
1. [Grant API access](https://docs.microsoft.com/azure/active-directory-b2c/microsoft-graph-get-started?tabs=app-reg-ga#grant-api-access), and make sure to select `Policy.ReadWrite.TrustFramework`.
1. [Create client secret](https://docs.microsoft.com/azure/active-directory-b2c/microsoft-graph-get-started?tabs=app-reg-ga#create-client-secret).

For more information, see [Deploy Azure AD B2C custom policy with GitHub actions](https://docs.microsoft.com/azure/active-directory-b2c/deploy-custom-policy-github-action).

## Sample workflow to deploy custom policies

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
      uses: azure-ad-b2c/deploy-trustframework-policy@v2
      with:
        folder: "./Policies"
        files: "TrustFrameworkBase.xml,TrustFrameworkExtensions.xml,SignUpOrSignin.xml"
        tenant: ${{ env.tenant }}
        clientId: ${{ env.clientId }}
        clientSecret: ${{ secrets.clientSecret }}
```

## Community Help and Support

Use [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-ad-b2c) to get support from the community. Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before. Make sure that your questions or comments are tagged with [azure-ad-b2c].

If you find a bug in the sample, please raise the issue on [GitHub Issues](https://github.com/azure-ad-b2c/deploy-trustframework-policy/issues).

To provide product feedback, visit the Azure AD B2C [feedback page](https://feedback.azure.com/forums/169401-azure-active-directory?category_id=160596).