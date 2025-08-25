import type { VisibilityState } from "@tanstack/react-table";
import type { ColumnConfig } from "@/shared/types/column-config";
import type { JsonData } from "@/shared/types/json-data";

export function generateTableCode(
    columns: ColumnConfig[],
    jsonData: JsonData[],
    columnVisibility: VisibilityState,
) {
    const visibleColumns = columns
        .filter((col) => columnVisibility[col.id])
        .sort((a, b) => a.order - b.order);

    // Feature detection
    const hasDateColumns = visibleColumns.some(col => col.type === "date");
    const hasFacetedFilters = visibleColumns.some(col => col.hasFacetedFilter && col.type === "string");
    const hasSliderFilters = visibleColumns.some(col => col.hasSliderFilter && col.type === "number");
    const hasBooleanColumns = visibleColumns.some(col => col.type === "boolean");
    const hasNumberColumns = visibleColumns.some(col => col.type === "number");
    const hasObjectColumns = visibleColumns.some(col => col.type === "object");

    // Generate imports based on features used
    const imports = [
        "import React, { useState } from 'react'",
        "import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, flexRender, type ColumnDef, type SortingState, type ColumnFiltersState, type VisibilityState } from '@tanstack/react-table'",
        "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'",
        "import { Input } from '@/components/ui/input'",
        "import { DataTableColumnHeader } from '@/data-table/data-table-column-header'",
        "import { DataTablePagination } from '@/components/data-table/data-table-pagination'",
        "import { DataTableViewOptions } from '@/components/data-table/data-table-view-options'"
    ];

    if (hasBooleanColumns) {
        imports.push("import { Badge } from '@/components/ui/badge'");
    }
    if (hasFacetedFilters) {
        imports.push("import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter'");
    }
    if (hasDateColumns) {
        imports.push("import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter'");
    }
    if (hasSliderFilters) {
        imports.push("import { DataTableSliderFilter } from '@/components/data-table/data-table-slider-filter'");
    }

    // Import filter functions based on usage
    const filterImports: string[] = [];
    if (hasNumberColumns || hasSliderFilters) {
        filterImports.push("numberFilter");
    }
    if (hasBooleanColumns) {
        filterImports.push("booleanFilter");
    }
    if (hasFacetedFilters) {
        filterImports.push("selectFilter", "multiSelectFilter");
    }
    if (hasObjectColumns) {
        filterImports.push("arrayContainsFilter");
    }
    if (hasDateColumns) {
        filterImports.push("dateRangeFilter");
    }

    if (filterImports.length > 0) {
        imports.push(`import { ${filterImports.join(", ")} } from '@/lib/filterFns-library'`);
    }

    const columnDefinitions = visibleColumns
        .map((column) => {
            let cellFunction = "";
            let filterFn = "";

            if (column.hasFacetedFilter && column.type === "string") {
                filterFn = `
    filterFn: "multiSelect" as const,`;
            } else if (column.type === "date") {
                filterFn = `
    filterFn: "dateRangeFilter" as const,`;
            } else if (column.hasSliderFilter && column.type === "number") {
                filterFn = `
    filterFn: "number" as const,`;
            }

            switch (column.type) {
                case "boolean":
                    cellFunction = `
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? "true" : "false"}
        </Badge>
      )
    },`;
                    break;
                case "number":
                    cellFunction = `
    cell: ({ getValue }) => {
      const value = getValue()
      return <span className="font-mono">{value?.toLocaleString()}</span>
    },`;
                    break;
                case "date":
                    cellFunction = `
    cell: ({ getValue }) => {
      const value = getValue()
      try {
        const date = new Date(value)
        return <span className="text-sm">{date.toLocaleDateString()}</span>
      } catch {
        return <span>{value}</span>
      }
    },`;
                    break;
                case "object":
                    cellFunction = `
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] block truncate">
          {JSON.stringify(value)}
        </code>
      )
    },`;
                    break;
                default:
                    cellFunction = `
    cell: ({ getValue }) => {
      const value = getValue()
      if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">null</span>
      }
      return <span className="max-w-[200px] block truncate">{String(value)}</span>
    },`;
            }

            return `  {
    id: "${column.id}",
    accessorKey: "${column.accessor}",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="${column.label}" />
    ),${filterFn}${cellFunction}
  }`;
        })
        .join(",\n");

    const dataString = JSON.stringify(jsonData, null, 2);

    const initialVisibilityEntries = Object.entries(columnVisibility)
        .filter(([_, visible]) => !visible)
        .map(([key, _]) => `    ${key}: false`);

    const initialVisibilityString =
        initialVisibilityEntries.length > 0
            ? `{\n${initialVisibilityEntries.join(",\n")}\n  }`
            : "{}";

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

        const uniqueValues = new Set<string>();
        jsonData.forEach((row) => {
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

    const facetedFilterOptionsCode = hasFacetedFilters ?
        columns
            .filter((col) => col.hasFacetedFilter && col.type === "string")
            .map((col) => {
                const options = getFacetedFilterOptions(col.id);
                if (options.length === 0) return "";
                const optionsString = options
                    .map((opt) => `  { label: "${opt.label}", value: "${opt.value}" }`)
                    .join(",\n");
                return `
const ${col.id}Options = [
${optionsString}
]`;
            })
            .filter(Boolean)
            .join("\n")
        : "";

    const facetedFiltersCode = hasFacetedFilters ?
        columns
            .filter((col) => col.hasFacetedFilter && col.type === "string")
            .map((col) => {
                const options = getFacetedFilterOptions(col.id);
                return options.length > 0
                    ? `          {table.getColumn("${col.id}") && (
            <DataTableFacetedFilter
              column={table.getColumn("${col.id}")}
              title="${col.label}"
              options={${col.id}Options}
            />
          )}`
                    : "";
            })
            .filter(Boolean)
            .join("\n")
        : "";

    const dateFiltersCode = hasDateColumns ?
        `
          {/* Date filters */}
          {${JSON.stringify(visibleColumns.filter(col => col.type === "date").map(col => col.id))}.slice(0, 2).map((columnId) => {
            const column = table.getColumn(columnId)
            if (!column) return null
            return (
              <DataTableDateFilter
                key={columnId}
                column={column}
                title={column.columnDef.header}
                multiple={true}
              />
            )
          })}`
        : "";

    const sliderFiltersCode = hasSliderFilters ?
        `          {/* Slider filters */}
          {${JSON.stringify(visibleColumns.filter(col => col.type === "number" && col.hasSliderFilter).map(col => col.id))}.slice(0, 3).map((columnId) => {
            const column = table.getColumn(columnId)
            if (!column) return null
            return (
              <DataTableSliderFilter
                key={columnId}
                column={column}
                title={column.columnDef.header}
              />
            )
          })}`
        : "";

    // Generate filter functions mapping only if needed
    const filterFnsCode = filterImports.length > 0 ?
        `    filterFns: {
      number: numberFilter,
      boolean: booleanFilter,
      select: selectFilter,
      multiSelect: multiSelectFilter,
      array: arrayContainsFilter,
      dateRangeFilter
    },` : "";

    return `'use client'

${imports.join("\n")}

// Define your data type here
type DataRow = {
  [key: string]: string | number | boolean | null | undefined | object
}
${facetedFilterOptionsCode}

const columns: ColumnDef<DataRow>[] = [
${columnDefinitions}
]

export default function TanstackTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(${initialVisibilityString})
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
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
${filterFnsCode}
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(String(event.target.value))}
          className="max-w-sm h-8"
        />
        <div className="flex items-center space-x-2 ml-auto">
${facetedFiltersCode}${dateFiltersCode}${sliderFiltersCode}
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}`;
}