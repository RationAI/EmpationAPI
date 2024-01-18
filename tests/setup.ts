import * as dotenv from 'dotenv';
const prefix = "EMAPI_";

export function getEnv(key: string, def=undefined) {
    let ret = process.env[`${prefix}${key}`];
    if (ret === undefined) return def;
    return ret;
}

dotenv.config({ path: './tests/test.env' });
