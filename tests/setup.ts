import auth, { AuthResult } from './auth';
import {HTTPError, parseJwtToken} from '../src';
import { getEnv } from './env';

interface InterceptAuthData {
  token?: string;
  expires?: number;
  authData?: AuthResult | null;
}

const usersData: Map<string, InterceptAuthData> = new Map<
  string,
  InterceptAuthData
>();
export const defaultTestUser: string = getEnv('AUTH_DEFAULT_USER')!;
export const defaultComparisonUser: string = getEnv('AUTH_COMPARE_USER')!;

async function doAuth(userName) {
  let context = usersData[userName];
  if (!context) context = usersData[userName] = {};
  console.log(`Request user login: ${userName}`);
  context.authData = await auth(userName);
  if (context.authData.access_token) {
    context.token = context.authData.access_token;
    context.expires = parseJwtToken(context.token).exp * 1000;
  }
  return context;
}

let interceptedUser = defaultTestUser;
export function setInterceptedUser(userName): void {
  interceptedUser = userName;
}

async function checkAuth(userName = interceptedUser) {
  let context = usersData[userName] || (await doAuth(userName));
  if (context) {
    let authData = context.authData;
    if (!authData) {
      return await doAuth(userName);
    }
    if (authData.access_token === false) {
      //disabled auth
      return false;
    }
    return context;
  }
  return false;
}

export async function getToken(userName = interceptedUser): Promise<string> {
  let context = await checkAuth(userName);
  if (!context) return '';
  return context.token;
}

export async function setupIntercept(polly, allUrls = false): Promise<void> {
  if (!interceptedUser) {
    throw (
      'Invalid setupIntercept call: invalid intercepted user name: ' +
      interceptedUser
    );
  }

  const interceptor = async (req, res) => {
    if (req.headers['Bypass-Interceptor']) {
      return;
    }

    const context = await checkAuth(interceptedUser);
    if (!context) {
      return;
    }
    if (context.expires - Date.now() < 5000) {
      await doAuth(interceptedUser);
    }
    //override missing auth
    req.headers['Authorization'] =
      req.headers['Authorization'] || `Bearer ${context.token}`;
  };
  polly.polly.server.any().on('request', interceptor);
}


function customErrorLogger() {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    args.forEach(arg => {
      if (arg instanceof HTTPError && arg.payload) {
        originalConsoleError(`${arg.statusCode} Error: ${arg.message}, Payload: ${JSON.stringify(arg.payload)}`);
      } else {
        originalConsoleError(arg);
      }
    });
  };
}
customErrorLogger();
