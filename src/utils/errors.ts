/**
 * Executes a provided callback which returns a Promise and handles the result.
 * @template T - The type of data returned by the Promise.
 * @param callback - The callback function that returns a Promise.
 * @returns A Promise that resolves to an object with status "success" and the data returned by the callback, or an object with status "error" if the Promise is rejected.
 */
export const promiseResult = async <T>(callback: () => Promise<T>) => {
	return callback()
		.then(
			(data) =>
				({
					status: "success",
					data,
					isError: false,
				}) as const,
		)
		.catch(
			(e: Error) =>
				({
					status: "error",
					error: e,
					isError: true,
				}) as const,
		);
};
