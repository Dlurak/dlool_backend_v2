export const areSameValue = <T>(first: T[], second: T[]): boolean => {
	if (first.length !== second.length) return false;
	if (first.length === 0) return true;

	const firstArrFirst = first[0];
	const secondArrFirst = first[0];

	if (firstArrFirst !== secondArrFirst) return false;

	return areSameValue(first.slice(1), second.slice(1));
};
