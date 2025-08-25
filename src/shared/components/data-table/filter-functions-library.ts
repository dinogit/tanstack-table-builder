import type { Row } from "@tanstack/react-table";
import type { DataRow } from "@/shared/types/row-config";

// Number range filter
export function numberFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: [number, number] | null,
): boolean {
	const raw = row.getValue(columnId);
	if (raw == null) return false;
	const rowValue = Number(raw);
	if (isNaN(rowValue)) return false;

	const [min, max] = filterValue ?? [];
	if (min != null && rowValue < min) return false;
	return !(max != null && rowValue > max);
}

// Text includes filter
export function textFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: string | null,
): boolean {
	if (!filterValue) return true;
	return String(row.getValue(columnId) ?? "")
		.toLowerCase()
		.includes(filterValue.toLowerCase());
}

// Boolean filter
export function booleanFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: boolean | null,
): boolean {
	if (filterValue == null) return true;
	return row.getValue(columnId) === filterValue;
}

// Single select filter
export function selectFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: string | null,
): boolean {
	if (!filterValue) return true;
	return row.getValue(columnId) === filterValue;
}

// Multi-select filter
export function multiSelectFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValues: string[] | null,
): boolean {
	if (!filterValues?.length) return true;
	return filterValues.includes(row.getValue(columnId) as string);
}

// Array contains filter
export function arrayContainsFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValues: string[] | null,
): boolean {
	if (!filterValues?.length) return true;
	const rowValues = row.getValue(columnId) as string[] | undefined;
	return rowValues ? filterValues.some((v) => rowValues.includes(v)) : false;
}

// Date range filter
export function dateRangeFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: [number?, number?] | null,
) {
	const raw = row.getValue(columnId) as string | number | Date;
	if (raw == null) return false;
	const rowDate = new Date(raw);
	if (isNaN(rowDate.getTime())) return false;
	if (!filterValue) return true;

	const [from, to] = filterValue;
	if (from && rowDate.getTime() < from) return false;
	return !(to && rowDate.getTime() > to);
}

// Nested object filter
function nestedObjectFilter(
	row: Row<DataRow>,
	columnId: string,
	filterValue: string | null,
): boolean {
	if (!filterValue) return true;
	const val = row.getValue(columnId) as { city?: string; country?: string };
	return <boolean>(
		(val?.city?.toLowerCase().includes(filterValue.toLowerCase()) ||
			val?.country?.toLowerCase().includes(filterValue.toLowerCase()))
	);
}

const filterFnRegistry = {
	string: textFilter,
	number: numberFilter,
	boolean: booleanFilter,
	enum: selectFilter,
	multiselect: multiSelectFilter,
	array: arrayContainsFilter,
	date: dateRangeFilter,
	object: nestedObjectFilter,
};
