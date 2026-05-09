import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AlgorithmName } from "@/interfaces/deliveryJob";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

export type AlgorithmResult = {
    algorithm: AlgorithmName;
    status: "running" | "completed" | "failed";
    volume_utilization: string;
    items_packed: number;
    items_total: number;
    execution_time_ms: string;
};

function formatExecutionTime(ms: number, t: TFunction): string {
    if (ms >= 60_000)
        return t("time.min", { value: (ms / 1000 / 60).toFixed(2) });
    if (ms >= 1_000) return t("time.s", { value: (ms / 1000).toFixed(2) });
    return t("time.ms", { value: ms });
}

export function createAlgorithmResultsColumns(
    t: TFunction,
): ColumnDef<AlgorithmResult>[] {
    return [
        {
            accessorKey: "algorithm",
            header: t("results.columns.algorithm"),
            cell: ({ row }) => (
                <div>{t(`algorithms.${row.original.algorithm}`)}</div>
            ),
        },
        {
            accessorKey: "volume_utilization",
            header: t("results.columns.volumeUtilization"),
            cell: ({ row }) => {
                const value = row.original.volume_utilization;
                return (
                    <div className="flex items-center gap-2">
                        <Progress value={parseFloat(value)} className="w-12" />
                        {value} %
                    </div>
                );
            },
        },
        {
            accessorKey: "execution_time_ms",
            header: t("results.columns.executionTime"),
            cell: ({ row }) => (
                <div>
                    {formatExecutionTime(
                        parseFloat(row.original.execution_time_ms),
                        t,
                    )}
                </div>
            ),
        },
        {
            accessorKey: "items_packed",
            header: t("results.columns.itemsPacked"),
            cell: ({ row }) => (
                <div>
                    {row.original.items_packed} / {row.original.items_total}
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row, table }) => {
                const { selectedAlgo, onSelectAlgo } = table.options
                    .meta as any;
                const isSelected = selectedAlgo === row.original.algorithm;
                return (
                    <Button
                        onClick={() => onSelectAlgo(row.original.algorithm)}
                        variant={isSelected ? "default" : "outline"}
                    >
                        {isSelected
                            ? t("results.selected")
                            : t("results.select")}
                    </Button>
                );
            },
        },
    ];
}
