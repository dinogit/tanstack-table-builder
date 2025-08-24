import {Link} from "@tanstack/react-router";


export function Page() {
    return (
        <div className="relative flex w-full flex-col items-center justify-start px-4 pt-16 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
            <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
                <h1 className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl">
                    <span className="inline-block px-1 md:px-2">Build</span>
                    <span className="inline-block px-1 md:px-2">Tables</span>
                    <span className="inline-block px-1 md:px-2">Faster</span>
                </h1>
                <p className="mx-auto max-w-xl text-center leading-7 text-muted-foreground">
                    Create tables with <a target="_blank" className="hover:underline" href="https://tanstack.com/table/latest"> Tanstack</a> within
                    seconds.
                </p>
                <div className="flex flex-row mx-auto pt-8">
                    <Link to={'/playground'} className="w-32 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        Get Started
                    </Link>
                </div>

            </div>
        </div>

    )
}