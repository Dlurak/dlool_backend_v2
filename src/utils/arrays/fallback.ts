/**
 * Fallback to `fallbackValue` if `defaultValue` is empty
 */
export const fallback = <T>(defaultValue: T[], fallbackValue: T[]) => {
	if (defaultValue.length === 0) {
		return fallbackValue;
	}
	return defaultValue;
};
