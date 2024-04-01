/**
 * Map the value to another one exept when it is undefined
 */
export const savePredicate = <T, R>(
	value: T | undefined,
	predicate: (arg: T) => R,
) => {
	if (typeof value === "undefined") return undefined;

	return predicate(value);
};
