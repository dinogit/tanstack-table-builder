/// <reference types="vite/client" />

import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NavBar } from "@/shared/components/navigation/nav-bar";
import { ThemeProvider } from "@/shared/providers/theme-provider";
import globalCss from "@/shared/styles/globals.css?url";
import {Analytics} from "@vercel/analytics/react";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Table Builder",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: globalCss,
			},
            {
                rel: "icon",
                type: "image/x-icon",
                href: "/favicon.svg",
            },

        ],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<NavBar />
				<Outlet />
                <Analytics />
			</ThemeProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
