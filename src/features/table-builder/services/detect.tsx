import {ColumnConfig} from "@/shared/types/column-config";
import {JsonData} from "@/shared/types/json-data";


export const detectColumnType = (value: string | number | boolean | null | undefined | object): ColumnConfig["type"] => {
    if (value === null || value === undefined) return "string"
    if (typeof value === "boolean") return "boolean"
    if (typeof value === "number") return "number"
    if (typeof value === "object") return "object"
    if (typeof value === "string") {
        // Try to detect dates
        const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}-\d{2}-\d{4}/
        if (dateRegex.test(value) && !isNaN(Date.parse(value))) {
            return "date"
        }
    }
    return "string"
}

export const detectColumns = (data: JsonData[]) => {
    if (data.length === 0) return []

    const firstRow = data[0]
    const detectedColumns: ColumnConfig[] = []

    Object.keys(firstRow).forEach((key, index) => {
        // Sample a few rows to get better type detection
        const sampleValues = data.slice(0, Math.min(5, data.length)).map((row) => row[key])
        const types = sampleValues.map(detectColumnType)
        const mostCommonType = types.reduce((a, b, _, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
        )

        detectedColumns.push({
            id: key,
            accessor: key,
            label:
                key.charAt(0).toUpperCase() +
                key
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")
                    .trim(),
            type: mostCommonType,
            order: index,
            hasDateFilter: false, // Default value for hasDateFilter
            hasSliderFilter: false, // Default value for hasSliderFilter
        })
    })

    return detectedColumns.sort((a, b) => a.order - b.order)
}