// Declaration file for modules without proper type definitions

declare module 'bcrypt' {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, saltOrRounds: number): Promise<string>;
}

declare module 'jsonwebtoken' {
  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string,
    options?: object
  ): string;
  
  export function verify(
    token: string,
    secretOrPublicKey: string,
    options?: object,
    callback?: (err: any, decoded: any) => void
  ): any;
}

declare module '@faker-js/faker' {
  export const faker: any;
} 