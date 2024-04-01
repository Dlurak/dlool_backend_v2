import { describe, expect, it } from "bun:test";
import { DATE } from "constants/regex";

describe("time regex", () => {
	it("works", async () => {
		expect(DATE.test("2024")).toBeTrue();
		expect(DATE.test("2024-12")).toBeTrue();
		expect(DATE.test("2024-12-31")).toBeTrue();

		expect(DATE.test("31.12.2024")).toBeFalse();
		expect(DATE.test("24-12-31")).toBeFalse();
		expect(DATE.test("24-2-31")).toBeFalse();
		expect(DATE.test("2024-12.31")).toBeFalse();
	});
});
