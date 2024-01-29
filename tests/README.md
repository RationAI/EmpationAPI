# Testing

For tests you have to enable authentication in case the deployed architecture
requires it. The configuration is done via test.env file, or ignored `.env` file
within the `test` directory:

> ``EMAPI_AUTH_MODULE`` is a value configuring which authentication is to be used, 
> this must be a name of module inside ``test/auth`` that export default function
> used in the auth process.

