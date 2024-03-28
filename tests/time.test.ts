import { describe, expect, it } from "bun:test";
import { wait } from "utils/time";

describe("time", () => {
	it("waits for the given amount of time", async () => {
		const time = 500;

		const start = Date.now();
		await wait(time);
		const end = Date.now();

		expect(end - start).toBeLessThan(time + 20);
		expect(end - start).toBeGreaterThanOrEqual(time);
	});
});
