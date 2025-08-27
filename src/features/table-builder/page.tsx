import * as React from "react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { FileText, Plus, Settings, X } from "lucide-react";

import { ColumnEditorSheet } from "@/features/table-builder/components/column-editor";
import { CopyCodeSheet } from "@/features/table-builder/components/copy-code-sheet";
import { DataInputSheet } from "@/features/table-builder/components/data-sheet";
import { detectColumns } from "@/features/table-builder/services/detect";
import {
	arrayContainsFilter,
	booleanFilter,
	dateRangeFilter,
	multiSelectFilter,
	numberFilter,
	selectFilter,
} from "@/shared/components/data-table/filter-functions-library";
import { generateTableCode } from "@/features/table-builder/services/generate-table-code";
import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { DataTableDateFilter } from "@/shared/components/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/shared/components/data-table/data-table-faceted-filter";
import { DataTablePagination } from "@/shared/components/data-table/data-table-pagination";
import { DataTableRowActions } from "@/shared/components/data-table/data-table-row-actions";
import { DataTableSliderFilter } from "@/shared/components/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/shared/components/data-table/data-table-view-options";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import type { ColumnConfig } from "@/shared/types/column-config";
import type { JsonData } from "@/shared/types/json-data";
import {useIsMobile} from "@/shared/hooks/use-mobile";

export function Page() {
    const isMobile = useIsMobile();

    const [data, setData] = React.useState<JsonData[]>([]);

	const [columns, setColumns] = React.useState<ColumnConfig[]>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [globalFilter, setGlobalFilter] = React.useState("");

	const [dataInputOpen, setDataInputOpen] = React.useState(false);
	const [columnEditorOpen, setColumnEditorOpen] = React.useState(false);

	const [toggleCopyCodeSheet, setToggleCopyCodeSheet] = React.useState(false);

	function handleDataChange(newData: JsonData[]) {
		setData(newData);

		if (newData.length > 0) {
			const detectedColumns = detectColumns(newData);
			setColumns(detectedColumns);

			const initialVisibility: VisibilityState = {};
			detectedColumns.forEach((column) => {
				initialVisibility[column.id] = true;
			});
			setColumnVisibility(initialVisibility);
		} else {
			setColumns([]);
			setColumnVisibility({});
		}
	}

    const tableColumns = React.useMemo<ColumnDef<JsonData>[]>(() => {
        const allColumns = columns.sort((a, b) => a.order - b.order);

        const dataColumns = allColumns.map((column) => {
            const baseColumn = {
                id: column.id,
                accessorKey: column.accessor,
                header: ({ column: tableColumn }) => (
                    <DataTableColumnHeader column={tableColumn} title={column.label} />
                ),
                cell: ({ getValue }) => {
                    const value = getValue();

                    if (value === null || value === undefined) {
                        return <span className="text-muted-foreground italic">null</span>;
                    }

                    switch (column.type) {
                        case "boolean":
                            return (
                                <Badge
                                    variant={value ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {value ? "true" : "false"}
                                </Badge>
                            );
                        case "number":
                            return <span className="font-mono">{value.toLocaleString()}</span>;
                        case "date":
                            try {
                                const date = new Date(value);
                                return (
                                    <span className="text-sm">{date.toLocaleDateString()}</span>
                                );
                            } catch {
                                return <span>{value}</span>;
                            }
                        case "object":
                            return (
                                <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] block truncate">
                                    {JSON.stringify(value)}
                                </code>
                            );
                        default:
                            return (
                                <span className="max-w-[200px] block truncate">
									{String(value)}
								</span>
                            );
                    }
                },
            };

            // Add filterFn conditionally
            if (column.hasFacetedFilter && column.type === "string") {
                return { ...baseColumn, filterFn: "multiSelect" as const };
            }
            if (column.type === "date") {
                return { ...baseColumn, filterFn: "dateRangeFilter" as const };
            }
            if (column.hasSliderFilter && column.type === "number") {
                return { ...baseColumn, filterFn: "number" as const };
            }

            return baseColumn;
        });

        const actionsColumn: ColumnDef<JsonData> = {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => <DataTableRowActions row={row} />,
        };

        return [...dataColumns, actionsColumn];
    }, [columns, columnVisibility]);


	const table = useReactTable({
		data: data,
		columns: tableColumns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: "includesStringSensitive",
		filterFns: {
			number: numberFilter,
			boolean: booleanFilter,
			select: selectFilter,
			multiSelect: multiSelectFilter,
			array: arrayContainsFilter,
			dateRangeFilter,
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			globalFilter,
		},
	});

	const getFacetedFilterOptions = (columnId: string) => {
		const column = columns.find((col) => col.id === columnId);
		if (!column || column.type !== "string") return [];

		if (
			column.optionsMode === "custom" &&
			column.options &&
			column.options.length > 0
		) {
			return column.options;
		}

		// Auto-detect from data
		const uniqueValues = new Set<string>();
		data.forEach((row) => {
			const value = row[columnId];
			if (value !== null && value !== undefined && typeof value === "string") {
				uniqueValues.add(value);
			}
		});

		if (uniqueValues.size < 2 || uniqueValues.size > 20) return [];

		return Array.from(uniqueValues)
			.sort()
			.map((value) => ({
				label: value,
				value: value,
			}));
	};

	const facetedFilterColumns = React.useMemo(() => {
		return columns
			.filter(
				(col) =>
					columnVisibility[col.id] &&
					col.hasFacetedFilter &&
					col.type === "string",
			)
			.map((col) => ({
				...col,
				options: getFacetedFilterOptions(col.id),
			}))
			.filter((col) => col.options.length > 0)
			.slice(0, 3);
	}, [columns, columnVisibility, data]);

	const dateFilterColumns = React.useMemo(() => {
		return columns
			.filter(
				(col) =>
					columnVisibility[col.id] && col.type === "date" && col.hasDateFilter,
			)
			.slice(0, 2);
	}, [columns, columnVisibility]);

	const sliderFilterColumns = React.useMemo(() => {
		return columns
			.filter(
				(col) =>
					columnVisibility[col.id] &&
					col.type === "number" &&
					col.hasSliderFilter,
			)
			.slice(0, 3);
	}, [columns, columnVisibility]);

	const resetFilters = () => {
		setGlobalFilter("");
		setColumnFilters([]);
		setSorting([]);
	};

	const hasActiveFilters = () => {
		return (
			globalFilter !== "" || columnFilters.length > 0 || sorting.length > 0
		);
	};

	return (
		<div className="min-h-screen bg-background p-4">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Tanstack Table Builder
					</h1>
					<p className="text-muted-foreground">
						Transform your JSON data into beautiful, exportable React tables
					</p>
				</div>

				{/* Live Preview Section */}
				<Card className="relative">
                    <CardHeader>
                        <div className={`${isMobile ? "space-y-4" : "flex items-center justify-between"}`}>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    Table Preview
                                </CardTitle>
                            </div>
                            <div className={`flex items-center gap-2 ${isMobile ? "flex-wrap" : ""}`}>
                                <Button
                                    variant="outline"
                                    size={isMobile ? "sm" : "sm"}
                                    onClick={() => setDataInputOpen(true)}
                                    className={isMobile ? "flex-1 min-w-0" : ""}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className={isMobile ? "truncate" : ""}>
										{data.length > 0 ? "Update Data" : "Add Data"}
									</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size={isMobile ? "sm" : "sm"}
                                    disabled={data.length === 0}
                                    onClick={() => setColumnEditorOpen(true)}
                                    className={isMobile ? "flex-1 min-w-0" : ""}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    <span className={isMobile ? "truncate" : ""}>
										{isMobile ? "Configure" : "Configure Columns"}
									</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size={isMobile ? "sm" : "sm"}
                                    disabled={data.length === 0}
                                    onClick={() => setToggleCopyCodeSheet(true)}
                                    className={isMobile ? "flex-1 min-w-0" : ""}
                                >
                                    Copy Code
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
						{data.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<FileText className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">
									No Data Available
								</h3>
								<p className="text-muted-foreground">
									Add your JSON data using the "Add Data" button above to see
									the table preview and configure columns.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Input
											placeholder="Filter all columns..."
											value={globalFilter ?? ""}
											onChange={(event) =>
												setGlobalFilter(String(event.target.value))
											}
											className="max-w-sm h-8"
										/>
										{facetedFilterColumns.map((column) => (
											<DataTableFacetedFilter
												key={column.id}
												column={table.getColumn(column.id)}
												title={column.label}
												options={column.options}
											/>
										))}
										{/* Date filters */}
                                        {dateFilterColumns.map((column) => {
                                            const tableColumn = table.getColumn(column.id);
                                            if (!tableColumn) return null;
                                            return (
                                                <DataTableDateFilter
                                                    key={column.id}
                                                    column={tableColumn}
                                                    title={column.label}
                                                    multiple={true}
                                                />
                                            );
                                        })}

                                        {/* Slider filters */}
										{sliderFilterColumns.map((column) => (
											<DataTableSliderFilter
												key={column.id}
												column={table.getColumn(column.id)}
												title={column.label}
											/>
										))}
										{hasActiveFilters() && (
											<Button
												variant="ghost"
												onClick={resetFilters}
												className="h-8 px-2 lg:px-3"
											>
												<X className="mr-2 h-4 w-4" />
												Reset
											</Button>
										)}
									</div>
									<div className="flex items-center space-x-2">
										<DataTableViewOptions table={table} />
									</div>
								</div>

								<div className="rounded-md border">
									<Table>
										<TableHeader>
											{table.getHeaderGroups().map((headerGroup) => (
												<TableRow key={headerGroup.id}>
													{headerGroup.headers.map((header) => (
														<TableHead key={header.id}>
															{header.isPlaceholder
																? null
																: flexRender(
																		header.column.columnDef.header,
																		header.getContext(),
																	)}
														</TableHead>
													))}
												</TableRow>
											))}
										</TableHeader>
										<TableBody>
											{table.getRowModel().rows?.length ? (
												table.getRowModel().rows.map((row) => (
													<TableRow key={row.id} className="hover:bg-muted/50">
														{row.getVisibleCells().map((cell) => (
															<TableCell key={cell.id} className="py-2">
																{flexRender(
																	cell.column.columnDef.cell,
																	cell.getContext(),
																)}
															</TableCell>
														))}
													</TableRow>
												))
											) : (
												<TableRow>
													<TableCell
														colSpan={tableColumns.length}
														className="h-24 text-center"
													>
														No results.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>

								<DataTablePagination table={table} />
							</div>
						)}
					</CardContent>
				</Card>

				{/* Data Input Sheet */}
				<DataInputSheet
					open={dataInputOpen}
					data={data}
					onDataChange={handleDataChange}
					onClose={() => setDataInputOpen(false)}
				/>

				{/* Column Editor Sheet */}
				<ColumnEditorSheet
					open={columnEditorOpen}
					onOpenChange={setColumnEditorOpen}
					columns={columns}
					setColumns={setColumns}
					columnVisibility={columnVisibility}
					setColumnVisibility={setColumnVisibility}
					jsonData={data}
				/>

				<CopyCodeSheet
					open={toggleCopyCodeSheet}
					onClose={() => setToggleCopyCodeSheet(false)}
					code={generateTableCode(columns, data, columnVisibility)}
                    data={data}
                    columns={columns}
                />
			</div>
		</div>
	);
}
