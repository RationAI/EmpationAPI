
export interface JwtTokenBase {
    sub: string,
    exp: number,
}

export interface JwtToken extends JwtTokenBase {
    iat: number;
    jti: string;
    iss: string;
    aud: string;
    typ: string;
    azp: string;
}

export function getJwtTokenExpiresTimeout(token: JwtTokenBase) {
    //timeout with 20 seconds slack OR 280 secs
    return token.exp*1e3 - Date.now() - 20e3 || 280e3;
}

export interface ScopeToken extends JwtTokenBase {
    token_id: number
}

export function parseJwtToken(token: string): JwtTokenBase {
    return JSON.parse(atob(token.split('.')[1]));
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Logger {
    static error(...args: any):void {
        console.error("E:EmpationAPI", ...args);
    }
    static warn(...args: any):void {
        console.warn("W:EmpationAPI", ...args);
    }
    static info(...args: any):void {
        console.info("I:EmpationAPI", ...args);
    }
    static debug(...args: any):void {
        console.debug("D:EmpationAPI", ...args);
    }
}
