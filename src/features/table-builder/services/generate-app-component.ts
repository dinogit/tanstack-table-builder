export function generateAppComponent() {
    return `import * as React from 'react';
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dataQuery } from "./data-query";
        
export function Page() {

    const { data } = useSuspenseQuery(dataQuery());

    return (
        <Card className="p-4 border-none">
            <CardHeader className="flex flex-row justify-between items-baseline">
                <div className="flex flex-col space-y-2">
                    <CardTitle>Data Table</CardTitle>
                    <CardDescription>
                        This page allows you to view and manage your data.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <DataTable data={data} columns={columns} />
            </CardContent>
        </Card>
    );
}
`;
}