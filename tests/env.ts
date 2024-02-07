import * as dotenv from 'dotenv';
// import * as fs from "fs";
const prefix = "EMAPI_";

export function getEnv(key: string, def=undefined) {
    let ret = process.env[`${prefix}${key}`];
    if (ret === undefined) return def;
    return ret;
}

export function getUserName(user: string) {
    let key = (user || "").trim().split(/\.?(?=[A-Z])/).join('_').toUpperCase();
    if (!key) throw `Invalid user name: '${user}'!`;
    let ret = process.env[`${prefix}AUTH_USER_${key}`];
    if (ret === undefined) throw `Invalid user name: '${user}': the env variable '${prefix}AUTH_USER_${key}' is not set!`;
    if (!ret) return user; //if set to empty suppose it is inherited
    return ret;
}

export function getUserPassword(user: string) {
    let key = (user || "").trim().split(/\.?(?=[A-Z])/).join('_').toUpperCase();
    if (!key) throw `Invalid user name: '${user}'!`;
    let ret = process.env[`${prefix}AUTH_USER_SECRET_${key}`];
    if (!ret) throw `Invalid user password: '${user}': the env variable '${prefix}AUTH_USER_SECRET_${key}' is not set!`;
    return ret;
}

// First loaded has assignment precedence
dotenv.config({ path: './tests/.env' });
dotenv.config({ path: './tests/test.env' });

// fs.stat('./tests/.env', function(err, stat) {
//     if (err == null) {
//         console.warn("Using the .env configuration.");
//         dotenv.config({ path: './tests/.env' });
//     } else if (err.code === 'ENOENT') {
//         // file not found
//         console.warn("Using the default test.env configuration! You might consider adjusting the test setup.");
//         dotenv.config({ path: './tests/test.env' });
//     } else {
//         console.warn("Failed to read custom .env configuration!");
//         dotenv.config({ path: './tests/test.env' });
//     }
// });
