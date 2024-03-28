import { describe, expect, it } from "bun:test";
import { randomNumber } from "utils/random";

describe("random number", () => {
	it("returns a random number", () => {
		const numbers: number[] = [];
		for (let i = 0; i < 100; i++) {
			numbers.push(randomNumber(0, 10));
		}

		expect(Math.min(...numbers)).toBe(0);
		expect(Math.max(...numbers)).toBe(10);

		const uniqueNumbers = new Set(numbers);
		expect(uniqueNumbers.size).toBe(11);
	});
});
