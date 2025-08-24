export function formatDate(
	date: Date | string | number,
	options?: Intl.DateTimeFormatOptions,
): string {
	const dateObj =
		typeof date === "string" || typeof date === "number"
			? new Date(date)
			: date;

	if (!dateObj || isNaN(dateObj.getTime())) {
		return "";
	}

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};

	return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}
