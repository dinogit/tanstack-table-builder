"use client";

import type { Column } from "@tanstack/react-table";
import { CalendarIcon, XCircle } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import {formatDate} from "date-fns";

type DateSelection = Date[] | DateRange;

function getIsDateRange(value: DateSelection): value is DateRange {
	return value && typeof value === "object" && !Array.isArray(value);
}

function parseAsDate(timestamp: number | string | undefined): Date | undefined {
	if (!timestamp) return undefined;
	const numericTimestamp =
		typeof timestamp === "string" ? Number(timestamp) : timestamp;
	const date = new Date(numericTimestamp);
	return !Number.isNaN(date.getTime()) ? date : undefined;
}

function parseColumnFilterValue(value: unknown) {
	if (value === null || value === undefined) {
		return [];
	}

	if (Array.isArray(value)) {
		return value.map((item) => {
			if (typeof item === "number" || typeof item === "string") {
				return item;
			}
			return undefined;
		});
	}

	if (typeof value === "string" || typeof value === "number") {
		return [value];
	}

	return [];
}

interface DataTableDateFilterProps {
	column: Column<any, unknown>;
	title?: string;
	multiple?: boolean;
}

export function DataTableDateFilter({
	column,
	title,
	multiple,
}: DataTableDateFilterProps) {
	const columnFilterValue = column.getFilterValue();

	const selectedDates = React.useMemo(() => {
		if (!columnFilterValue) {
			return multiple ? { from: undefined, to: undefined } : [];
		}

		if (multiple) {
			const timestamps = parseColumnFilterValue(columnFilterValue);
			return {
				from: parseAsDate(timestamps[0]),
				to: parseAsDate(timestamps[1]),
			};
		}

		const timestamps = parseColumnFilterValue(columnFilterValue);
		const date = parseAsDate(timestamps[0]);
		return date ? [date] : [];
	}, [columnFilterValue, multiple]);

	const onSelect = React.useCallback(
		(date: Date | DateRange | undefined) => {
			if (!date) {
				column.setFilterValue(undefined);
				return;
			}

			if (multiple && !("getTime" in date)) {
				const from = date.from?.getTime();
				const to = date.to?.getTime();
				column.setFilterValue(from || to ? [from, to] : undefined);
			} else if (!multiple && "getTime" in date) {
				column.setFilterValue(date.getTime());
			}
		},
		[column, multiple],
	);

	const onReset = React.useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			column.setFilterValue(undefined);
		},
		[column],
	);

	const hasValue = React.useMemo(() => {
		if (multiple) {
			if (!getIsDateRange(selectedDates)) return false;
			return selectedDates.from || selectedDates.to;
		}
		if (!Array.isArray(selectedDates)) return false;
		return selectedDates.length > 0;
	}, [multiple, selectedDates]);

    const formatDateRange = React.useCallback((range: DateRange) => {
        if (!range.from && !range.to) return "";
        if (range.from && range.to) {
            return `${formatDate(range.from, 'PPP')} - ${formatDate(range.to, 'PPP')}`;
        }
        const validDate = range.from || range.to;
        return validDate ? formatDate(validDate, 'PPP') : "";
    }, []);


    const label = React.useMemo(() => {
		if (multiple) {
			if (!getIsDateRange(selectedDates)) return null;

			const hasSelectedDates = selectedDates.from || selectedDates.to;
			const dateText = hasSelectedDates
				? formatDateRange(selectedDates)
				: "Select date range";

			return (
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium">{title}</span>
					{hasSelectedDates && (
						<>
							<Separator orientation="vertical" className="h-4" />
							<span className="text-sm text-muted-foreground">{dateText}</span>
						</>
					)}
				</div>
			);
		}

		if (getIsDateRange(selectedDates)) return null;

		const hasSelectedDate = selectedDates.length > 0;
		const dateText = hasSelectedDate
			? formatDate(selectedDates[0], 'PPP')
			: "Select date";

		return (
			<div className="flex items-center space-x-2">
				<span className="text-sm font-medium">{title}</span>
				{hasSelectedDate && (
					<>
						<Separator orientation="vertical" className="h-4" />
						<span className="text-sm text-muted-foreground">{dateText}</span>
					</>
				)}
			</div>
		);
	}, [selectedDates, multiple, formatDateRange, title]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 border-dashed bg-transparent"
				>
					{hasValue ? (
						<XCircle
							className="mr-2 h-4 w-4 cursor-pointer"
							onClick={onReset}
						/>
					) : (
						<CalendarIcon className="mr-2 h-4 w-4" />
					)}
					{label}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				{multiple ? (
					<Calendar
						mode="range"
						selected={getIsDateRange(selectedDates) ? selectedDates : undefined}
						onSelect={onSelect}
						numberOfMonths={2}
						initialFocus
					/>
				) : (
					<Calendar
						mode="single"
						selected={
							Array.isArray(selectedDates) ? selectedDates[0] : undefined
						}
						onSelect={onSelect}
						initialFocus
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
