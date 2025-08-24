import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/features/home/page";

export const Route = createFileRoute("/")({
	component: Page,
});
