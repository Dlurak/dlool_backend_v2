/**
 * Remove duplicates from an array
 * The original array will not be modified
 * The order will not be changed
 */
export const removeDuplicates = <T>(arr: T[]) => {
	return arr.filter((val, i, self) => self.indexOf(val) === i);
};
