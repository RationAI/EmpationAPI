# EmpationAPI Library

This is a front-end lightweight library for communication with the workbench service.
The library is used by RationAI javascript applications to have uniform
and tested access to the API with selected features. The API is not mirrored fully, 
but rather implements few selected uses routines. Any query can be performed easily
on the target context class using ``rawQuery(...)`` which populates the request with
all necessary data common to all API requests to that context.

Type definitions are taken from the official Empaia frontend WBC library.
https://gitlab.com/empaia/integration/frontend-workspace

### Supported WBS versions:
 - [x] v3


### V3 Usage:
````js
const api = new V3.Root({
    workbenchApiUrl: 'https://url.to.workbench.api'
});
// The library expects root api having intercepted communication
//  that assigns an access token for the WORKBENCH CLIENT. 
//  The token can be obtained using for example OIDC client and
//  intercepted library communication using library of a choice.
//  The token also stores the user id:
api.from(token);
api.cases.list(); //lists available cases

// To access SCOPES API you need to provide a case ID and optionally app ID:
api.scopes.use(caseId); //default scope bound only to the case
api.scopes.use(caseId, appId); //default scope bound to case AND app
````

### Testing

For automated type testing, first types must be compiled:

> For version 3 compile the types using:
> ```npm run ttypes-v3```

Then, tests can be run using ``npm run test``. However, you first need to set up the test environmental variables.
``test/test.env`` is an example env file for the testing. Notable is the authentication setup:

````bash
# The authentication module. A filename without extension in `test/auth/` implementing auth style.
EMAPI_AUTH_MODULE=no-auth
# The client againts which we authenticate (see oAuth/Keycloak)
EMAPI_AUTH_CLIENT=
EMAPI_AUTH_CLIENT_SECRET=
# The authentication URL
EMAPI_AUTH_URL=

# Provide default test user
EMAPI_AUTH_DEFAULT_USER=pathologist
# Provide user comparison tests user, if not set comparison tests are not run
EMAPI_AUTH_COMPARE_USER=
# Users can be specified dynamically: simply provide userName identifier (camelcase) 
# which is automatically converted to underscore & capital env style
# if user name empty the identifier is used as the actual user name
EMAPI_AUTH_USER_PATHOLOGIST=
EMAPI_AUTH_USER_SECRET_PATHOLOGIST=
````
