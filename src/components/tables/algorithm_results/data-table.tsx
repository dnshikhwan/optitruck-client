"use client";

import { useMemo } from "react";
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    selectedAlgo: string;
    onSelectAlgo: (algo: string) => void;
}

export function AlgorithmResultsDataTable<TData, TValue>({
    columns,
    data,
    selectedAlgo,
    onSelectAlgo,
}: DataTableProps<TData, TValue>) {
    // Only re-sort when the underlying array reference changes
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const aVal = parseFloat((a as any).volume_utilization ?? "0");
            const bVal = parseFloat((b as any).volume_utilization ?? "0");
            return bVal - aVal;
        });
    }, [data]);

    // Stable meta object — only a new reference when its pieces actually change
    const meta = useMemo(
        () => ({ selectedAlgo, onSelectAlgo }),
        [selectedAlgo, onSelectAlgo],
    );

    const table = useReactTable({
        data: sortedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta,
    });

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext(),
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
