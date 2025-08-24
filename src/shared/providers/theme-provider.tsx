import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	// Start with defaultTheme - do NOT access localStorage during initial state
	const [theme, setTheme] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	// Effect to read from localStorage after hydration
	useEffect(() => {
		setMounted(true);
		try {
			const storedTheme = localStorage.getItem(storageKey) as Theme;
			if (storedTheme) {
				setTheme(storedTheme);
			}
		} catch (error) {
			// localStorage not available, use default
			console.warn("localStorage not available, using default theme");
		}
	}, [storageKey]);

	useEffect(() => {
		// Only apply theme changes after component is mounted (hydrated)
		if (!mounted) return;

		try {
			const root = window.document.documentElement;

			root.classList.remove("light", "dark");

			if (theme === "system") {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";

				root.classList.add(systemTheme);
				return;
			}

			root.classList.add(theme);
		} catch (error) {
			// window/document not available
			console.warn("DOM manipulation not available");
		}
	}, [theme, mounted]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			try {
				if (mounted && typeof window !== "undefined") {
					localStorage.setItem(storageKey, theme);
				}
				setTheme(theme);
			} catch (error) {
				// localStorage not available, still update state
				setTheme(theme);
			}
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};
