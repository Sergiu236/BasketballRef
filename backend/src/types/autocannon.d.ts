/**
 * Minimal declaration so the TypeScript compiler stops complaining.
 * We purposely declare the export as `any` to avoid mismatches
 * with the library’s internal typings.
 */
declare module 'autocannon' {
  const autocannon: any;
  export = autocannon;
}
