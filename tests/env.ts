import * as dotenv from 'dotenv';
import * as fs from "fs";
const prefix = "EMAPI_";

export function getEnv(key: string, def=undefined) {
    let ret = process.env[`${prefix}${key}`];
    if (ret === undefined) return def;
    return ret;
}

// First loaded has assignment precedence
dotenv.config({ path: './tests/.env' });
dotenv.config({ path: './tests/test.env' });

//
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
