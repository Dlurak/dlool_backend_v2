import { describe, expect, it } from "bun:test";
import { currentCustomDate, currentDay } from "utils/dates/current";

describe("current date", () => {
	it("current day", () => {
		const day = currentDay();
		expect(day).toBeGreaterThanOrEqual(1);
		expect(day).toBeLessThanOrEqual(31);
	});
	it("current custom date", () => {
		const date = currentCustomDate();

		expect(date.day).toBeGreaterThanOrEqual(1);
		expect(date.day).toBeLessThanOrEqual(31);
		expect(date.month).toBeGreaterThanOrEqual(1);
		expect(date.month).toBeLessThanOrEqual(12);
		expect(date.year).toBeGreaterThanOrEqual(1970);
	});
});
