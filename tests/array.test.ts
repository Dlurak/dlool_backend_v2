import { describe, expect, it } from "bun:test";
import { removeDuplicates } from "utils/arrays/duplicates";
import { areSameValue } from "utils/arrays/general";
import { merge } from "utils/arrays/merge";

describe("merge", () => {
	it("same length", () => {
		const result = merge(
			{ key: "a", array: [1, 2, 3] },
			{ key: "b", array: ["x", "y", "z"] },
		);

		expect(result).toEqual([
			{ a: 1, b: "x" },
			{ a: 2, b: "y" },
			{ a: 3, b: "z" },
		]);
	});

	it("works when the first one is longer", () => {
		const result = merge(
			{ key: "a", array: [1, 2, 3] },
			{ key: "b", array: ["a"] },
		);

		expect(result).toEqual([
			{ a: 1, b: "a" },
			{ a: 2, b: undefined },
			{ a: 3, b: undefined },
		]);
	});

	it("works when the second one is longer", () => {
		const result = merge(
			{ key: "b", array: ["a"] },
			{ key: "a", array: [1, 2, 3] },
		);

		expect(result).toEqual([
			{ b: "a", a: 1 },
			{ b: undefined, a: 2 },
			{ b: undefined, a: 3 },
		]);
	});
});

describe("duplicates", () => {
	it("does nothing when there'no duplicates", () => {
		expect(removeDuplicates([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
		expect(removeDuplicates(["a", "b", "c"])).toEqual(["a", "b", "c"]);
	});

	it("removes duplicates", () => {
		expect(removeDuplicates([1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1])).toEqual([
			1, 2,
		]);
		expect(
			removeDuplicates(["ts", "rust", "linux", "i3", "linux", "js", "rust"]),
		).toEqual(["ts", "rust", "linux", "i3", "js"]);
	});
});

describe("same value", () => {
	it("works for equal arrays", () => {
		const testCases = [[], ["a", "a"], ["a", "b"], [1, 2], [1, 1]];

		for (const tCase of testCases) {
			// @ts-ignore
			expect(areSameValue(tCase, tCase)).toBeTrue();
		}
	});
});