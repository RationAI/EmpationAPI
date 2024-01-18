
export interface JwtToken {
    exp: number;
    iat: number;
    jti: string;
    iss: string;
    sub: string;
    aud: string;
    typ: string;
    azp: string;
}


export function parseJwtToken(token: string): JwtToken {
    return JSON.parse(atob(token.split('.')[1]));
}
