/**
 * Returns a random number between min (inclusive) and max (inclusive)
 * @param min - The minimum number (inclusive)
 * @param max - The maximum number (inclusive)
 * @returns A random number between min and max
 */
export const randomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};
