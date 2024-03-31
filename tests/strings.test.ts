import { describe, expect, it } from "bun:test";
import { split } from "utils/strings/split";

describe("split", () => {
	it("splits at ,", () => {
		const original = "value,value2,valu5,";
		expect(split(original)).toEqual(["value", "value2", "valu5", ""]);
		expect(original).toBe("value,value2,valu5,");
	});

	it("ignores escaped commas", () => {
		const original = "this\\,is\\,;one,and\\,this\\,another";
		expect(split(original)).toEqual(["this,is,;one", "and,this,another"]);
	});
});
