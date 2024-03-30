type Object = Record<string | number | symbol, unknown>;

type ConverDatesDeep<T extends Object, R> = {
	[K in keyof T]: T[K] extends Date
		? R
		: T[K] extends Object
			? ConverDatesDeep<T[K], R>
			: T[K];
};

type DateCallback<T> = (val: Date) => T;

export const replaceDateDeep = <T extends Object, R>(
	obj: T,
	callback: DateCallback<R>,
): ConverDatesDeep<T, R> => {
	const pairs = Object.entries(obj);
	const newPairs: [string, unknown][] = [];
	for (const [key, val] of pairs) {
		if (val instanceof Date) newPairs.push([key, callback(val)]);
		else if (typeof val === "object" && val)
			newPairs.push([key, replaceDateDeep(val as Object, callback)]);
		else newPairs.push([key, val]);
	}

	return Object.fromEntries(newPairs) as ConverDatesDeep<T, R>;
};

/**
 * Replaces all Date objects in an object with their timestamp
 */
export const replaceDateWithTimestamp = <T extends Object>(obj: T) =>
	replaceDateDeep(obj, (val) => val.getTime());
