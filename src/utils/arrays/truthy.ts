/**
 * Checks if at least one truthy value exists in the array.
 * @param arr - The array to be checked.
 * @returns True if at least one truthy value exists, otherwise false.
 * @example
 * ```typescript
 * // Returns true since there is at least one truthy value in the array
 * atLeastOneTruthy([0, 1, false, true, '', 'hello']);
 * ```
 *
 * @example
 * ```typescript
 * // Returns false since all elements in the array are falsy
 * atLeastOneTruthy([0, false, '', null, undefined]);
 * ```
 */
export const atLeastOneTruthy = (arr: unknown[]) =>
	arr.map((i) => !!i).some((b) => b);
