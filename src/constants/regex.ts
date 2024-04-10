/**
 * A regular expression to match one of the following date formats:
 * - `2020`
 * - `2020-12`
 * - `2020-12-31`
 */
export const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

/**
 * A regular expression to match passwords with:
 * - At least 8 charachters in total
 * - At least one uppercase charachter
 * - At least one lowercase charachter
 * - At least one digit
 * - At least one special charachter
 */
export const PASSWORD =
	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;

/**
 * A regular expression to match a hex color
 * - Only lowercase
 * - 3 or 6 digits
 * - Starting with a #
 */
export const COLOR = /^#[0-9a-f]{3}([0-9a-f]{3})?$/;
