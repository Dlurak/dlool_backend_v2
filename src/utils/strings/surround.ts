type Surround<T extends string, S extends string> = `${S}${T}${S}`;

/**
 * Surround a string with a specified other string
 *
 * @example
 * ```ts
 * surround('hello', '*') === '*hello*'
 * ```
 */
export const surround = <T extends string, S extends string>(
	str: T,
	surrounder: S,
) => `${surrounder}${str}${surrounder}` as Surround<T, S>;
