import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { FileUpload } from "@/shared/components/ui/file-upload";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import type { FileWithPreview } from "@/shared/hooks/use-file-upload";
import { SAMPLE_DATA } from "@/shared/lib/constants";

export type JsonData = Record<
	string,
	string | number | boolean | null | undefined | object
>;

interface DataInputSheetProps {
	open: boolean;
	onClose: (open: boolean) => void;
	data: JsonData[];
	onDataChange: (data: JsonData[]) => void;
}

export function DataInputSheet({
	open,
	onClose,
	data,
	onDataChange,
}: DataInputSheetProps) {
	const id = React.useId();

	function onUpload(file: FileWithPreview) {
		const reader = new FileReader();

		if (!(file.file instanceof File)) {
			toast.error("Invalid file", {
				description: "Cannot read file metadata. Please upload a new file.",
			});
			return;
		}

		reader.onload = (e) => {
			try {
				const jsonData = JSON.parse(e.target?.result as string);

				if (!Array.isArray(jsonData)) {
					throw new Error("JSON must be an array of objects");
				}

				if (jsonData.length === 0) {
					throw new Error("Array cannot be empty");
				}

				if (
					!jsonData.every(
						(item) =>
							typeof item === "object" && item !== null && !Array.isArray(item),
					)
				) {
					throw new Error("All items in the array must be objects");
				}

				onDataChange(jsonData);
				onClose(false);
			} catch (error) {
				toast.error("Invalid JSON format", {
					description: (error as Error).message,
				});
			}
		};

		reader.onerror = (e) => {
			toast.error("Failed to read file", {
				description: e.target?.error?.message || "An unknown error occurred",
			});
		};

		reader.readAsText(file.file);
	}

	function onPaste(e: React.ChangeEvent<HTMLTextAreaElement>) {
		try {
			const jsonData = JSON.parse(e.target.value);

			if (!Array.isArray(jsonData)) {
				throw new Error("JSON must be an array of objects");
			}

			if (jsonData.length === 0) {
				throw new Error("Array cannot be empty");
			}

			if (
				!jsonData.every(
					(item) =>
						typeof item === "object" && item !== null && !Array.isArray(item),
				)
			) {
				throw new Error("All items in the array must be objects");
			}

			onDataChange(jsonData);
			onClose(false);
		} catch (error) {
			toast.error("Error parsing JSON:", {
				description: (error as Error).message,
			});
		}
	}

	function onSampleDataSet() {
		onDataChange(SAMPLE_DATA);
		onClose(false);
	}

	return (
		<Sheet open={open} onOpenChange={onClose}>
			<SheetContent side="right" className="w-full sm:max-w-lg">
				<SheetHeader className="p-2 lg:p-6">
					<SheetTitle>Add Data</SheetTitle>
					<SheetDescription>
						Upload a JSON file, paste JSON data, or use sample data to get
						started.
					</SheetDescription>
				</SheetHeader>
				<ScrollArea className="h-[calc(100vh-120px)] px-6">
					<div className="space-y-6 pr-4">
                        <Label>Upload data</Label>
						<FileUpload
							accept={[".json"]}
							onUpload={async (file: FileWithPreview) => onUpload(file)}
							maxSize={1024 * 1024}
						/>

						<div className="space-y-2">
							<Label htmlFor="json-input">Or Paste JSON Data</Label>
							<Textarea
								id={id}
								placeholder="Paste your JSON array here..."
								className="field-sizing-content max-h-29.5 min-h-0 py-1.75"
								value={JSON.stringify(data, null, 2)}
								onChange={(e) => onPaste(e)}
								rows={4}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="json-input">Or start with sample data</Label>
							<div className="flex flex-row space-x-2">
								<Button variant="outline" onClick={() => onSampleDataSet()}>
									Add Sample Data
								</Button>
								<Button variant="outline" onClick={() => onDataChange([])}>
									Clear Data
								</Button>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
