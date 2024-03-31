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
