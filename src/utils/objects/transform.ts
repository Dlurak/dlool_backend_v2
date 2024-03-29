type Object = Record<string | number | symbol, unknown>;

type ConvertDatesOther<T extends Object, R> = {
	[K in keyof T]: T[K] extends Date ? R : T[K];
};

type DateCallback<T> = (val: Date) => T;

export const replaceDate = <T extends Object, R>(
	obj: T,
	callback: DateCallback<R>,
): ConvertDatesOther<T, R> => {
	const pairs = Object.entries(obj);
	const newPairs: [string, unknown][] = [];
	for (const [key, val] of pairs) {
		if (val instanceof Date) newPairs.push([key, callback(val)]);
		else newPairs.push([key, val]);
	}

	return Object.fromEntries(newPairs) as ConvertDatesOther<T, R>;
};

/**
 * Replaces all Date objects in an object with their timestamp
 */
export const replaceDateWithTimestamp = <T extends Object>(obj: T) =>
	replaceDate(obj, (val) => val.getTime());
