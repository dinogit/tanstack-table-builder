import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import type { Table } from "@tanstack/react-table"

import { Button } from "@/shared/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu"

interface DataTableActionBarProps<TData> {
  table: Table<TData>
  container?: Element | DocumentFragment | null
  visible?: boolean
}

export function DataTableActionBar<TData>({
  table,
  container = typeof document !== "undefined" ? document.body : null,
  visible = true, // Default to always visible
}: DataTableActionBarProps<TData>) {
  const [isPending, setIsPending] = React.useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isVisible = visible

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        table.resetRowSelection()
      }
    }

    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible, table])

  const handleEdit = async () => {
    setIsPending(true)
    try {
      // TODO: Implement edit functionality
      console.log(
        "[v0] Edit selected rows:",
        selectedRows.map((row) => row.original),
      )
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation
    } finally {
      setIsPending(false)
    }
  }

  const handleDelete = async () => {
    setIsPending(true)
    try {
      // TODO: Implement delete functionality
      console.log(
        "[v0] Delete selected rows:",
        selectedRows.map((row) => row.original),
      )
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate async operation
      table.resetRowSelection()
    } finally {
      setIsPending(false)
    }
  }

  if (!container) return null

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-lg">
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium">{selectedRows.length} selected</span>
            </div>

            <div className="h-6 w-px bg-border" />

            <TooltipProvider>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      disabled={isPending || selectedRows.length === 0}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit selected</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit selected</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={isPending || selectedRows.length === 0} // Disable when no rows selected
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete selected</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete selected</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isPending}>
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => table.resetRowSelection()}>Clear selection</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TooltipProvider>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    container,
  )
}
