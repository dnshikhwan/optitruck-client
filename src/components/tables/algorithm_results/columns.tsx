import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AlgorithmName } from "@/interfaces/deliveryJob";
import type { ColumnDef } from "@tanstack/react-table";

export type AlgorithmResult = {
    algorithm: AlgorithmName;
    status: "running" | "completed" | "failed";
    volume_utilization: string;
    items_packed: number;
    items_total: number;
    execution_time_ms: string;
};

export const algorithmResultsColumns: ColumnDef<AlgorithmResult>[] = [
    {
        accessorKey: "algorithm",
        header: "Algorithm",
        cell: ({ row }) => {
            const algo = row.original.algorithm;
            switch (algo) {
                case "greedy_search":
                    return <div>Greedy Search</div>;
                case "h1":
                    return <div>H1</div>;
                case "bottom_left_fill":
                    return <div>Bottom Left Fill</div>;
                case "extreme_point":
                    return <div>Extreme Point</div>;
                case "grasp_vnd":
                    return <div>GRASP/VND</div>;
            }
        },
    },

    {
        accessorKey: "volume_utilization",
        header: "Volume Utilization",
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
        header: "Execution Time",
        cell: ({ row }) => {
            const execution_time = parseFloat(row.original.execution_time_ms);
            if (execution_time >= 1000) {
                return (
                    <div>
                        {execution_time / 1000 >= 60
                            ? (execution_time / 1000 / 60).toFixed(2) + " min"
                            : (execution_time / 1000).toFixed(2) + " s"}
                    </div>
                );
            }
            return <div>{execution_time} ms</div>;
        },
    },
    {
        accessorKey: "items_packed",
        header: "Items Packed",
        cell: ({ row }) => {
            const items_packed = row.original.items_packed;
            const total = row.original.items_total;
            return (
                <div>
                    {items_packed} / {total}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const { selectedAlgo, onSelectAlgo } = table.options.meta as any;
            const isSelected = selectedAlgo === row.original.algorithm;
            return (
                <Button
                    onClick={() => onSelectAlgo(row.original.algorithm)}
                    variant={isSelected ? "default" : "outline"}
                >
                    {isSelected ? "Selected" : "Select"}
                </Button>
            );
        },
    },
];
