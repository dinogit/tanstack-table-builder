import type { ColumnConfig } from '@/shared/types/column-config';

export function generateColumn(columns: ColumnConfig[]): string {
  // Feature detection
  const hasBooleanColumns = columns.some(col => col.type === 'boolean');
  const hasFacetedFilters = columns.some(col => col.hasFacetedFilter);
  const hasDateFilters = columns.some(col => col.hasDateFilter);
  const hasSliderFilters = columns.some(col => col.hasSliderFilter);

  // Imports
  const imports = [
    "import type { ColumnDef } from '@tanstack/react-table';",
    "import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';"
  ];
  if (hasBooleanColumns) {
    imports.push("import { Badge } from '@/components/ui/badge';");
  }
  if (hasFacetedFilters) {
    imports.push("import { DataTableFacetedFilter } from '@/components/data-table/data-table-faceted-filter';");
  }
  if (hasDateFilters) {
    imports.push("import { DataTableDateFilter } from '@/components/data-table/data-table-date-filter';");
  }
  if (hasSliderFilters) {
    imports.push("import { DataTableSliderFilter } from '@/components/data-table/data-table-slider-filter';");
  }

  // Column definitions
  const columnDefs = columns.map(col => {
    const obj: Record<string, string> = {};
    obj["accessorKey"] = `'${col.accessor}'`;
    obj["header"] = `({ column }) => <DataTableColumnHeader column={column} title='${col.label}' />`;
    if (col.hasFacetedFilter) {
      obj["filter"] = "DataTableFacetedFilter";
    } else if (col.hasDateFilter) {
      obj["filter"] = "DataTableDateFilter";
    } else if (col.hasSliderFilter) {
      obj["filterFn"] = "inNumberRange";
    }
    if (col.type === 'boolean') {
      obj["cell"] = `({ row }) => <Badge>{row.getValue('${col.accessor}') ? 'Yes' : 'No'}</Badge>`;
    }
    // Build the object literal string
    const props = Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join(',\n    ');
    return `  {\n    ${props}\n  }`;
  }).join(',\n');

  return `${imports.join('\n')}

export const columns: ColumnDef<any>[] = [
${columnDefs}
];
`;
}
