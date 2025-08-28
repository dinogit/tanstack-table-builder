import {CheckIcon, CopyIcon, Info} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { CodeBlock } from "@/shared/lib/code-block";
import { cn } from "@/shared/lib/utils";
import {JsonData} from "@/shared/types/json-data";
import {ColumnConfig} from "@/shared/types/column-config";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/shared/components/tremor/tabs";
import {generateColumn} from "@/features/table-builder/services/generate-column";
import {generateQuery} from "@/features/table-builder/services/generate-tanstack-query";
import {generateAppComponent} from "@/features/table-builder/services/generate-app-component";

interface CopyCodeSheetProps {
	open: boolean;
	onClose: (open: boolean) => void;
	code: string;
    data: JsonData[],
    columns: ColumnConfig[]
}

export function CopyCodeSheet({ code, open, onClose, data, columns }: CopyCodeSheetProps) {

    let theme = "github-light";
    const [copied, setCopied] = React.useState<boolean>(false);

    if (typeof window !== "undefined") {
        const storedTheme = localStorage.getItem("vite-ui-theme");

        if (storedTheme === "system") {
            theme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "github-dark"
                : "github-light";
        } else if (storedTheme === "dark") {
            theme = "github-dark";
        } else if (storedTheme === "light") {
            theme = "github-light";
        }
    }

    // Generate clean data code
    const dataCode = `${JSON.stringify(data, null, 2)}`;

    // Generate clean columns code (extract from the full code to maintain the actual column definitions)
    // Use a more robust approach to extract the complete columns array
    const extractColumns = (code: string) => {
        const startMatch = code.match(/const columns: ColumnDef<DataRow>\[\] = \[/);
        if (!startMatch) return null;

        const startIndex = startMatch.index! + startMatch[0].length - 1; // Include the opening [
        let bracketCount = 0;
        let endIndex = startIndex;

        // Find the matching closing bracket
        for (let i = startIndex; i < code.length; i++) {
            if (code[i] === '[') bracketCount++;
            if (code[i] === ']') bracketCount--;
            if (bracketCount === 0) {
                endIndex = i;
                break;
            }
        }

        const columnsContent = code.substring(startIndex, endIndex + 1);
        return `const columns: ColumnDef<DataRow>[] = ${columnsContent}`;
    };

    const columnsCode = `// columns.tsx \n export ${extractColumns(code) || `export const columns = ${JSON.stringify(columns, null, 2)}`}`;

    // Clean table code - remove data and columns sections
    const tableCode = code
        .replace(/const data: DataRow\[\] = \[[\s\S]*?]\n/, '') // Remove data array
        .replace(/const \w+Options = \[[\s\S]*?]\n/g, '') // Remove faceted filter options
        .replace(/const columns: ColumnDef<DataRow>\[] = \[[\s\S]*?]\n/, '') // Remove columns array
        .replace(/^\n+/, '') // Remove leading newlines
        .trim();


    async function handleCopy(content: string) {
        	try {
        		await navigator.clipboard.writeText(content);
        		setCopied(true);
        		setTimeout(() => setCopied(false), 1500);
        	} catch (err) {
        		toast.error("Failed to copy code");
        	}
    }


    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full max-w-lg lg:max-w-4xl">
                <SheetHeader className="p-6">
                    <SheetTitle>Copy Code</SheetTitle>
                    <SheetDescription>
                        Choose what to copy: data, column configuration, or the complete table code.
                    </SheetDescription>
                </SheetHeader>
                <div className="p-6">
                    <Tabs defaultValue="table" className="h-full">
                        <TabsList>
                            <TabsTrigger value="data">Data</TabsTrigger>
                            <TabsTrigger value="columns">Columns</TabsTrigger>
                            <TabsTrigger value="table">TanStack Table</TabsTrigger>
                            <TabsTrigger value="query">TanStack Query</TabsTrigger>
                            <TabsTrigger value="page">Page</TabsTrigger>
                        </TabsList>

                        <TabsContent value="data" className="relative mt-4">
                            <div className="relative">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="z-10 absolute border-none shadow-none top-4 right-4 disabled:opacity-100"
                                            onClick={() => handleCopy(dataCode)}
                                            aria-label={copied ? "Copied" : "Copy to clipboard"}
                                            disabled={copied}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                )}
                                            >
                                                <CheckIcon
                                                    className="stroke-emerald-500"
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                )}
                                            >
                                                <CopyIcon size={16} aria-hidden="true" />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">
                                        Click to copy data
                                    </TooltipContent>
                                </Tooltip>

                                <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border">
                                    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading...</div>}>
                                        <CodeBlock lang="json" theme={theme}>{dataCode}</CodeBlock>
                                    </React.Suspense>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="columns" className="relative mt-4">
                            <div className="relative">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="z-10 absolute border-none shadow-none top-4 right-4 disabled:opacity-100"
                                            onClick={() => handleCopy(generateColumn(columns))}
                                            aria-label={copied ? "Copied" : "Copy to clipboard"}
                                            disabled={copied}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                )}
                                            >
                                                <CheckIcon
                                                    className="stroke-emerald-500"
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                )}
                                            >
                                                <CopyIcon size={16} aria-hidden="true" />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">
                                        Click to copy columns
                                    </TooltipContent>
                                </Tooltip>

                                <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border">
                                    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading...</div>}>
                                        <CodeBlock lang="ts" theme={theme}>{generateColumn(columns)}</CodeBlock>
                                    </React.Suspense>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="table" className="relative mt-4">
                            <div className="relative">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="z-10 absolute border-none shadow-none top-4 right-4 disabled:opacity-100"
                                            onClick={() => handleCopy(tableCode)}
                                            aria-label={copied ? "Copied" : "Copy to clipboard"}
                                            disabled={copied}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                )}
                                            >
                                                <CheckIcon
                                                    className="stroke-emerald-500"
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                )}
                                            >
                                                <CopyIcon size={16} aria-hidden="true" />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">
                                        Click to copy table code
                                    </TooltipContent>
                                </Tooltip>

                                <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border">
                                    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading...</div>}>
                                        <CodeBlock lang="tsx" theme={theme}>{tableCode}</CodeBlock>
                                    </React.Suspense>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="query" className="relative mt-4">
                            <div className="relative">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="z-10 absolute border-none shadow-none top-4 right-4 disabled:opacity-100"
                                            onClick={() => handleCopy(generateQuery())}
                                            aria-label={copied ? "Copied" : "Copy to clipboard"}
                                            disabled={copied}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                )}
                                            >
                                                <CheckIcon
                                                    className="stroke-emerald-500"
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                )}
                                            >
                                                <CopyIcon size={16} aria-hidden="true" />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">
                                        Click to copy table code
                                    </TooltipContent>
                                </Tooltip>

                                <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border">
                                    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading...</div>}>
                                        <CodeBlock lang="tsx" theme={theme}>{generateQuery()}</CodeBlock>
                                    </React.Suspense>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="page" className="relative mt-4">
                            <div className="relative">
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="z-10 absolute border-none shadow-none top-4 right-4 disabled:opacity-100"
                                            onClick={() => handleCopy(generateAppComponent())}
                                            aria-label={copied ? "Copied" : "Copy to clipboard"}
                                            disabled={copied}
                                        >
                                            <div
                                                className={cn(
                                                    "transition-all",
                                                    copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
                                                )}
                                            >
                                                <CheckIcon
                                                    className="stroke-emerald-500"
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <div
                                                className={cn(
                                                    "absolute transition-all",
                                                    copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
                                                )}
                                            >
                                                <CopyIcon size={16} aria-hidden="true" />
                                            </div>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="px-2 py-1 text-xs">
                                        Click to copy table code
                                    </TooltipContent>
                                </Tooltip>

                                <ScrollArea className="h-[calc(100vh-250px)] w-full rounded-md border">
                                    <React.Suspense fallback={<div className="p-4 animate-pulse">Loading...</div>}>
                                        <CodeBlock lang="tsx" theme={theme}>{generateAppComponent()}</CodeBlock>
                                    </React.Suspense>
                                </ScrollArea>
                            </div>

                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
