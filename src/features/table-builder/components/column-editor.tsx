"use client"
import {Card, CardContent} from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Badge } from "@/shared/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { GripVertical, Plus, X, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import type { VisibilityState } from "@tanstack/react-table"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as React from 'react'
import {ColumnConfig} from "@/shared/types/column-config";
import {JsonData} from "@/shared/types/json-data";

interface ColumnEditorSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    columns: ColumnConfig[]
    setColumns: (columns: ColumnConfig[] | ((prev: ColumnConfig[]) => ColumnConfig[])) => void
    columnVisibility: VisibilityState
    setColumnVisibility: (visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void
    jsonData: JsonData[]
}

interface SortableColumnCardProps {
    column: ColumnConfig
    index: number
    onUpdateLabel: (columnId: string, newLabel: string) => void
    onToggleFacetedFilter: (columnId: string, enabled: boolean) => void
    onToggleDateFilter: (columnId: string, enabled: boolean) => void
    onToggleSliderFilter: (columnId: string, enabled: boolean) => void
    onUpdateOptionsMode: (columnId: string, mode: "auto" | "custom") => void
    onAddCustomOption: (columnId: string) => void
    onUpdateCustomOption: (columnId: string, optionIndex: number, field: "label" | "value", value: string) => void
    onRemoveCustomOption: (columnId: string, optionIndex: number) => void
    onDeleteColumn: (columnId: string) => void
    getFacetedFilterOptions: (columnId: string) => any[]
    columnVisibility: VisibilityState
    setColumnVisibility: (visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void
}

function SortableColumnCard({
                                column,
                                index,
                                onUpdateLabel,
                                onToggleFacetedFilter,
                                onToggleDateFilter,
                                onToggleSliderFilter,
                                onUpdateOptionsMode,
                                onAddCustomOption,
                                onUpdateCustomOption,
                                onRemoveCustomOption,
                                onDeleteColumn,
                                getFacetedFilterOptions,
                                columnVisibility,
                                setColumnVisibility,
                            }: SortableColumnCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`m-8 ${isDragging ? 'ring-2 ring-primary' : ''}`}
        >
            <CardContent className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={columnVisibility[column.accessor]}
                            onCheckedChange={(checked) => {
                                setColumnVisibility((prev) => ({
                                    ...prev,
                                    [column.accessor]: checked === true,
                                }))
                            }}
                        />
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{column.accessor}</span>
                            <Badge variant="secondary" className="text-xs">
                                {column.type}
                            </Badge>
                            {column.hasFacetedFilter && (
                                <Badge variant="outline" className="text-xs">
                                    Faceted
                                </Badge>
                            )}
                            {column.hasDateFilter && (
                                <Badge variant="outline" className="text-xs">
                                    Date Filter
                                </Badge>
                            )}
                            {column.hasSliderFilter && (
                                <Badge variant="outline" className="text-xs">
                                    Slider Filter
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteColumn(column.id)}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Column Label */}
                <div className="space-y-1">
                    <Label className="text-sm">Display Label</Label>
                    <Input
                        value={column.label}
                        onChange={(e) => onUpdateLabel(column.id, e.target.value)}
                        placeholder="Enter display label"
                        className="text-sm"
                    />
                </div>

                {/* Faceted Filter Controls */}
                {column.type === "string" && (
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`faceted-${column.id}`}
                                checked={column.hasFacetedFilter || false}
                                onCheckedChange={(checked) => onToggleFacetedFilter(column.id, checked === true)}
                            />
                            <Label htmlFor={`faceted-${column.id}`} className="text-sm font-medium">
                                Enable Faceted Filter
                            </Label>
                        </div>

                        {column.hasFacetedFilter && (
                            <div className="space-y-2 ml-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Options Mode:</Label>
                                    <Select
                                        value={column.optionsMode || "auto"}
                                        onValueChange={(value: "auto" | "custom") => onUpdateOptionsMode(column.id, value)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="auto">Auto-detect</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {column.optionsMode === "custom" && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Custom Options</Label>
                                            <Button variant="outline" size="sm" onClick={() => onAddCustomOption(column.id)}>
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {(column.options || []).map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder="Label"
                                                        value={option.label}
                                                        onChange={(e) =>
                                                            onUpdateCustomOption(column.id, optionIndex, "label", e.target.value)
                                                        }
                                                        className="flex-1 text-xs"
                                                    />
                                                    <Input
                                                        placeholder="Value"
                                                        value={option.value}
                                                        onChange={(e) =>
                                                            onUpdateCustomOption(column.id, optionIndex, "value", e.target.value)
                                                        }
                                                        className="flex-1 text-xs"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRemoveCustomOption(column.id, optionIndex)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {column.type === "date" && (
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`datefilter-${column.id}`}
                                checked={column.hasDateFilter || false}
                                onCheckedChange={(checked) => onToggleDateFilter(column.id, checked === true)}
                            />
                            <Label htmlFor={`datefilter-${column.id}`} className="text-sm font-medium">
                                Enable Date Filter
                            </Label>
                        </div>
                        {column.hasDateFilter && (
                            <div className="ml-6 text-xs text-muted-foreground">
                                Users can filter this column by selecting a date range with start and end dates.
                            </div>
                        )}
                    </div>
                )}

                {column.type === "number" && (
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`sliderfilter-${column.id}`}
                                checked={column.hasSliderFilter || false}
                                onCheckedChange={(checked) => onToggleSliderFilter(column.id, checked === true)}
                            />
                            <Label htmlFor={`sliderfilter-${column.id}`} className="text-sm font-medium">
                                Enable Slider Filter
                            </Label>
                        </div>
                        {column.hasSliderFilter && (
                            <div className="ml-6 text-xs text-muted-foreground">
                                Users can filter this column using a range slider with min/max values.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function ColumnEditorSheet({
                                      open,
                                      onOpenChange,
                                      columns,
                                      setColumns,
                                      columnVisibility,
                                      setColumnVisibility,
                                      jsonData,
                                  }: ColumnEditorSheetProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const updateColumnLabel = (columnId: string, newLabel: string) => {
        setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, label: newLabel } : col)))
    }

    const toggleFacetedFilter = (columnId: string, enabled: boolean) => {
        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === columnId) {
                    const updatedCol = { ...col, hasFacetedFilter: enabled }
                    // Initialize options mode when enabling faceted filter
                    if (updatedCol.hasFacetedFilter && !updatedCol.optionsMode) {
                        updatedCol.optionsMode = "auto"
                    }
                    return updatedCol
                }
                return col
            }),
        )
    }

    const toggleDateFilter = (columnId: string, enabled: boolean) => {
        setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, hasDateFilter: enabled } : col)))
    }

    const toggleSliderFilter = (columnId: string, enabled: boolean) => {
        setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, hasSliderFilter: enabled } : col)))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            setColumns((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id)
                const newIndex = prev.findIndex((item) => item.id === over.id)

                const reorderedColumns = arrayMove(prev, oldIndex, newIndex)

                // Update the order property for each column
                return reorderedColumns.map((col, index) => ({ ...col, order: index }))
            })
        }
    }

    const getFacetedFilterOptions = (columnId: string) => {
        const column = columns.find((col) => col.id === columnId)
        if (!column || column.type !== "string") return []

        if (column.optionsMode === "custom" && column.options && column.options.length > 0) {
            return column.options
        }

        // Auto-detect from data
        const uniqueValues = new Set<string>()
        jsonData.forEach((row) => {
            const value = row[columnId]
            if (value !== null && value !== undefined && typeof value === "string") {
                uniqueValues.add(value)
            }
        })

        if (uniqueValues.size < 2 || uniqueValues.size > 20) return []

        return Array.from(uniqueValues)
            .sort()
            .map((value) => ({
                label: value,
                value: value,
            }))
    }

    const updateColumnOptionsMode = (columnId: string, mode: "auto" | "custom") => {
        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === columnId) {
                    const updatedCol = { ...col, optionsMode: mode }
                    // If switching to custom mode and no options exist, initialize with auto-detected ones
                    if (mode === "custom" && (!col.options || col.options.length === 0)) {
                        const autoOptions = getFacetedFilterOptions(columnId)
                        updatedCol.options = autoOptions
                    }
                    return updatedCol
                }
                return col
            }),
        )
    }

    const addCustomOption = (columnId: string) => {
        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === columnId) {
                    const newOptions = [...(col.options || []), { label: "", value: "" }]
                    return { ...col, options: newOptions }
                }
                return col
            }),
        )
    }

    const updateCustomOption = (columnId: string, optionIndex: number, field: "label" | "value", value: string) => {
        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === columnId && col.options) {
                    const newOptions = [...col.options]
                    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value }
                    return { ...col, options: newOptions }
                }
                return col
            }),
        )
    }

    const removeCustomOption = (columnId: string, optionIndex: number) => {
        setColumns((prev) =>
            prev.map((col) => {
                if (col.id === columnId && col.options) {
                    const newOptions = col.options.filter((_, index) => index !== optionIndex)
                    return { ...col, options: newOptions }
                }
                return col
            }),
        )
    }

    const deleteColumn = (columnId: string) => {
        // Remove from columns array
        setColumns((prev) => prev.filter((col) => col.id !== columnId))

        // Remove from column visibility state
        setColumnVisibility((prev) => {
            const newVisibility = { ...prev }
            const columnToDelete = columns.find((col) => col.id === columnId)
            if (columnToDelete) {
                delete newVisibility[columnToDelete.accessor]
            }
            return newVisibility
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-3xl">
                <SheetHeader>
                    <SheetTitle>Configure Columns</SheetTitle>
                    <SheetDescription>Customize column labels, visibility, and filter options. Drag columns to reorder them.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] mt-6">
                    <div className="space-y-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext items={columns.map(col => col.id)} strategy={verticalListSortingStrategy}>
                                {columns.map((column, index) => (
                                    <SortableColumnCard
                                        key={column.id}
                                        column={column}
                                        index={index}
                                        onUpdateLabel={updateColumnLabel}
                                        onToggleFacetedFilter={toggleFacetedFilter}
                                        onToggleDateFilter={toggleDateFilter}
                                        onToggleSliderFilter={toggleSliderFilter}
                                        onUpdateOptionsMode={updateColumnOptionsMode}
                                        onAddCustomOption={addCustomOption}
                                        onUpdateCustomOption={updateCustomOption}
                                        onRemoveCustomOption={removeCustomOption}
                                        onDeleteColumn={deleteColumn}
                                        getFacetedFilterOptions={getFacetedFilterOptions}
                                        columnVisibility={columnVisibility}
                                        setColumnVisibility={setColumnVisibility}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}