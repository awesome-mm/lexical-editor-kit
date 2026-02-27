/**
 * Optional require for optional peer dependencies.
 * In CJS environments returns the module; in ESM returns null (require is unavailable).
 */
export function optionalRequire<T = unknown>(name: string): T | null {
  try {
    if (typeof require !== "undefined") {
      return require(name) as T;
    }
  } catch {
    // module not installed or load error
  }
  return null;
}

const PACKAGE_TABLE = "@lexical/table";

export function getOptionalTable(): typeof import("@lexical/table") | null {
  return optionalRequire<typeof import("@lexical/table")>(PACKAGE_TABLE);
}
