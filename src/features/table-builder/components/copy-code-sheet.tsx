import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { codeToHtml } from "shiki";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { CodeBlock } from "@/shared/lib/code-block";
import { cn } from "@/shared/lib/utils";

interface CopyCodeSheetProps {
	open: boolean;
	onClose: (open: boolean) => void;
	code: string;
}

export function CopyCodeSheet({ code, open, onClose }: CopyCodeSheetProps) {
	const [copied, setCopied] = React.useState<boolean>(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (err) {
			toast.error("Failed to copy code");
		}
	};

	return (
		<Sheet open={open} onOpenChange={onClose}>
			<SheetContent side="right" className="w-full sm:max-w-3xl">
				<SheetHeader className="p-6">
					<SheetTitle>Copy Code</SheetTitle>
					<SheetDescription>
						Upload a JSON file, paste JSON data, or use sample data to get
						started.
					</SheetDescription>
				</SheetHeader>
				<div className="p-6 relative">
					<Tooltip delayDuration={0}>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="icon"
								className="z-10 absolute border-none shadow-none top-8 right-8 disabled:opacity-100"
								onClick={handleCopy}
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
							Click to copy
						</TooltipContent>
					</Tooltip>

					<ScrollArea className="h-[calc(100vh-200px)] w-full rounded-md border">
						<CodeBlock lang="ts">{code}</CodeBlock>
					</ScrollArea>
				</div>
			</SheetContent>
		</Sheet>
	);
}
