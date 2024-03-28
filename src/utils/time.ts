/**
 * Wait for a given amount of time
 * @param ms - The amount of time to wait in milliseconds
 * @returns A promise that resolves after the given amount of time
 * @example
 * ```ts
 * await wait(1000);
 * console.log("Hello, world!");
 * ```
 */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
