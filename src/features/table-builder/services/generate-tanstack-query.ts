


export function generateQuery(): string {
    return `// data-query.ts
import { queryOptions } from "@tanstack/react-query";
import data from './data.json'

async function getData(): Promise<Array<unknown>> {
    // Replace with actual data fetching logic

    return data;
}

export const dataQuery = () => {
    return queryOptions({
        queryKey: ['DATA_QUERY'],
        queryFn: () => getData(),
    });
};
`;
}
