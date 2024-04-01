import { DATE } from "constants/regex";
import type { CustomDate } from "types/date";

/**
 * Converts a custom date record to a normal js date
 */
export const customDateToNormal = (customDate: CustomDate) => {
	return new Date(customDate.year, customDate.month - 1, customDate.day);
};

/**
 * Converts a normal js date to a custom date record
 */
export const normalDateToCustom = (date: Date) => {
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();

	return { day, month, year };
};

/**
 * Converts a string to a custom date
 */
export const stringToCustom = (date: string) => {
	if (!DATE.test(date)) {
		throw new Error(`Date doesn't match date regex /${DATE}/`);
	}

	/**
	 * The year, month and day
	 * RegEx makes sure it is -
	 * - `year` will be a number with 4 digits
	 * - `month` will either be undefined or 2 digits
	 * - `day` will either be undefined or 2 digits
	 */
	const parts = date.split("-").map((n) => Number.parseInt(n));

	return {
		year: parts[0],
		month: parts[1] || 1,
		day: parts[1] || 1,
	};
};

export const stringToNormal = (date: string) =>
	customDateToNormal(stringToCustom(date));
