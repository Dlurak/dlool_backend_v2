interface MergeInput<T, K extends string> {
	array: T[];
	key: K;
}

type MergeResult<F, FK extends string, S, SK extends string> = {
	[K in FK]: F | undefined;
} & {
	[K in SK]: S | undefined;
};

/**
 * Merge two arrays into one
 */
export const merge = <F, FK extends string, S, SK extends string>(
	first: MergeInput<F, FK>,
	second: MergeInput<S, SK>,
) => {
	type Rec = MergeResult<F, FK, S, SK>;

	const mergedArray: Rec[] = [];
	const maxLength = Math.max(first.array.length, second.array.length);

	for (let i = 0; i < maxLength; i++) {
		const entries = [
			[first.key, first.array[i]],
			[second.key, second.array[i]],
		] as const;

		mergedArray.push(Object.fromEntries(entries) as Rec);
	}

	return mergedArray;
};
