import { describe, expect, it } from "bun:test";
import { replaceDateWithTimestamp } from "utils/objects/transform";

describe("transform", () => {
	it("replaces all dates with timestamps", () => {
		const obj = {
			date: new Date("2021-01-01"),
			number: 1,
			string: "hello",
		};

		const result = replaceDateWithTimestamp(obj);
		expect(result).toEqual({
			date: 1609459200000,
			number: 1,
			string: "hello",
		});
	});

	it("works recursively", () => {
		const obj = {
			date: new Date("2021-01-01"),
			arrayStuff: [
				{
					date: new Date("2021-01-01"),
					number: 1,
				},
				{
					date: new Date("2021-01-01"),
					number: 1,
				},
				{
					date: new Date("2021-01-01"),
					number: 1,
				},
			],
			inner: {
				date: new Date("2021-01-01"),
				number: 1,
				string: "hello",
			},
		};

		expect(replaceDateWithTimestamp(obj)).toEqual({
			date: 1609459200000,
			arrayStuff: [
				{
					date: 1609459200000,
					number: 1,
				},
				{
					date: 1609459200000,
					number: 1,
				},
				{
					date: 1609459200000,
					number: 1,
				},
			],
			inner: {
				date: 1609459200000,
				number: 1,
				string: "hello",
			},
		});
	});
});
