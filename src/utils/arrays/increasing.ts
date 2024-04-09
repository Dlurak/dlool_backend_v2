export const isIncreasing = (arr: number[]): boolean => {
	if (arr.length <= 1) return true

	const [first, second] = arr.slice(0, 2)
	if (second < first) return false

	return isIncreasing(arr.slice(1))
}
