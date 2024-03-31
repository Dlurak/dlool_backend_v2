import { describe, expect, it } from "bun:test";
import { promiseResult } from "utils/errors";

describe("error handling", () => {
	it("transforms errors to values", async () => {
		const error = new Error("error message");
		const callback = () => Promise.reject(error);

		const result = await promiseResult(callback);

		expect(result).toEqual({
			isError: true,
			status: "error",
			error,
		});

		// @ts-expect-error I want to test that the data is undefined
		expect(result.data).toBeUndefined();
	});

	it("gives the data", async () => {
		const data = 42;
		const callback = () => Promise.resolve(data);

		const result = await promiseResult(callback);

		expect(result).toEqual({
			isError: false,
			status: "success",
			data,
		});

		// @ts-expect-error I want to test that the error is undefined
		expect(result.error).toBeUndefined();
	});
});
