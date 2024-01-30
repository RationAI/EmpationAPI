# EmpationAPI Library

This is a front-end lightweight library for communication with the workbench service.
The library is used by RationAI javascript applications to have uniform
and tested access to the API with selected features.

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
api.use(userId); // or api.from(token);
api.cases.list(); //lists available cases

// To access SCOPES API you need to provide a case ID and optionally app ID:
api.scopes.use(caseId); //default scope bound only to the case
api.scopes.use(caseId, appId); //default scope bound to case AND app
````
