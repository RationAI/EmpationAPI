
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
    static error(...args):void {
        console.error("E:EmpationAPI", ...args);
    }
    static warn(...args):void {
        console.warn("W:EmpationAPI", ...args);
    }
    static info(...args):void {
        console.info("I:EmpationAPI", ...args);
    }
    static debug(...args):void {
        console.debug("D:EmpationAPI", ...args);
    }
}
