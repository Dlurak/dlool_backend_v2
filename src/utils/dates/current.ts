/**
 * Returns the current day
 * Ranging from 1 to 31 (inclusive)
 */
export const currentDay = () => new Date().getDate();

/**
 * Returns the current month
 * Ranging from 1 to 12 (inclusive)
 */
export const currentMonth = () => new Date().getMonth() + 1;

/**
 * Returns the current year
 * e.g. 2021
 */
export const currentYear = () => new Date().getFullYear();

/**
 * Returns the current date
 * e.g. { day: 1, month: 1, year: 2021 }
 */
export const currentCustomDate = () => ({
	day: currentDay(),
	month: currentMonth(),
	year: currentYear(),
});
