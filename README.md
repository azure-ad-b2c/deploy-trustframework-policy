# GitHub Action for deploying Azure AD B2C custom policies

Use this GitHub Action to deploy an [Azure AD B2C custom policy](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-overview) into your Azure Active Directory B2C tenant using the [Microsoft Graph API](https://docs.microsoft.com/graph/api/resources/trustframeworkpolicy?view=graph-rest-beta). If the policy does not yet exist, it will be created. If the policy already exists, it will be replaced.

For more information, see [Deploy Azure AD B2C custom policy with GitHub actions](https://docs.microsoft.com/azure/active-directory-b2c/deploy-custom-policies-github-action).

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
      uses: azure-ad-b2c/deploy-trustframework-policy@v5
      with:
        folder: "./Policies"
        files: "TrustFrameworkBase.xml,TrustFrameworkExtensions.xml,SignUpOrSignin.xml"
        tenant: ${{ env.tenant }}
        clientId: ${{ env.clientId }}
        clientSecret: ${{ secrets.clientSecret }}
```

## Developer notes

To update new version you must package this GitHub Action. Use the following commands to package the project:

```bash
npm run-script build  
npm run-script package
```

You can find more information about these scripts in the [package.json](package.json) file. For example:

```json
"scripts": {
    "build": "tsc",
    "format": "prettier --write **/*.ts",
    "format-check": "prettier --check **/*.ts",
    "lint": "eslint src/**/*.ts",
    "package": "ncc build --source-map --license licenses.txt",
    "test": "jest",
    "all": "npm run build && npm run format && npm run lint && npm run package && npm test"
  }
```

After the build is completed, you can see that the JavaScript files under the [dist](dist) folder changed with the latest version of your TypeScript code.

### Build issues

The GitHub build runs the scrips as described above. The `lint` script runs the  [eslint](https://eslint.org/) command. This command analyzes your code to quickly find problems. You can change the settings of the eslint command in the [.eslintrc.json](.eslintrc.json) file. The following example suppresses some of the errors:

```json
"rules": {
    "i18n-text/no-en": 0,
    "import/named": "warn",
    "github/no-then": "warn",
    "eslint-comments/no-use": "off",
    "import/no-namespace": "off",
    "no-unused-vars": "off",
```

### Run test

When you commit a change to any branch or a PR, the [test.yml](.github/workflows/test.yml) workflow runs with `clientId` parameter set to `test`. The `test` value indicates to the GitHub Action to exit the test successfully. We exit the test because because the  required parameters are not configured in this repo.

To test the GitHub Action create your own repo, add the workflow. Then configure the [uses](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsuses) to point to your branch, fork, or commit. The following example demonstrate how to configure the workflow to use the latest commit in the `vNext` branch.

```bash
- name: 'Upload custom policies'
  uses: azure-ad-b2c/deploy-trustframework-policy@vNext
```

## Community Help and Support

Use [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-ad-b2c) to get support from the community. Ask your questions on Stack Overflow first and browse existing issues to see if someone has asked your question before. Make sure that your questions or comments are tagged with [azure-ad-b2c].

If you find a bug in the sample, please raise the issue on [GitHub Issues](https://github.com/azure-ad-b2c/deploy-trustframework-policy/issues).

To provide product feedback, visit the Azure AD B2C [feedback page](https://feedback.azure.com/forums/169401-azure-active-directory?category_id=160596).
