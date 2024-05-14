# Testing

For tests you have to enable authentication in case the deployed architecture
requires it. The configuration is done via test.env file, or ignored `.env` file
within the `test` directory:

> `EMAPI_AUTH_MODULE` is a value configuring which authentication is to be used,
> this must be a name of module inside `test/auth` that export default function
> used in the auth process.

### Intercepting tested requests for auth

Must be done in two steps:

- each file must being with `/** @jest-environment setup-polly-jest/jest-environment-node */`
- each file must call inside `describe`:
  ```js
  const pollyCtx = polly();
  beforeEach(() => setupIntercept(pollyCtx));
  ```

### Using `fetch` for authentication

Since we are intercepting communication, intercepting also AUTH might be unwanted
behaviour. The auth interceptor respects `'Bypass-Interceptor': 'true'` header
to avoid infinite loop. Also by default, `setupIntercept()` only intercepts
the WBC urls.
