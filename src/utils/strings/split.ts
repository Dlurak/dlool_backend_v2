/**
 * Split a string at commas but not escaped ones
 */
export const split = (str: string) =>
	str.split(/(?<!\\),/).map((s) => s.replace(/\\,/g, ","));
