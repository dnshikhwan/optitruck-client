// src/components/tables/algo_comparison/columns.tsx

import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AlgorithmName } from "@/interfaces/deliveryJob";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";

export type AlgorithmResult = {
    algorithm: AlgorithmName;
    status: "running" | "completed" | "failed";
    volume_utilization: number;
    weight_utilization: number | null;
    items_packed: number;
    items_total: number;
    execution_time_ms: number;

    // Validation fields
    lifo_ok: boolean;
    lifo_violations: number;
    support_ok: boolean;
    avg_support_ratio: number | null;
    fragility_ok: boolean;
    fragility_violations: number;
    cog_ok: boolean;
    cog_ratio: number | null;
};

// Shared badge renderer. The `detail` prop is shown inline when the check failed
// (e.g., "LIFO ✗ 12" shows the violation count). For passing checks we just show
// the check icon to keep the cell compact. The tooltip explains what the check means.
function ValidationBadge({
    ok,
    label,
    detail,
    explanation,
}: {
    ok: boolean;
    label: string;
    detail?: string | number | null;
    explanation: string;
}) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex justify-center">
                        <Badge
                            className={
                                ok
                                    ? "bg-green-400/10 text-green-400 hover:bg-green-400/20"
                                    : "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                            }
                        >
                            {ok ? (
                                <Check className="h-3 w-3 mr-1" />
                            ) : (
                                <X className="h-3 w-3 mr-1" />
                            )}
                            {label}
                            {!ok && detail != null && (
                                <span className="ml-1">({detail})</span>
                            )}
                        </Badge>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="max-w-xs text-xs">{explanation}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// For FAILED algorithms we want to gray out the validation columns since the
// underlying data is meaningless. This renders an em-dash.
function FailedPlaceholder() {
    return <div className="text-center text-muted-foreground">—</div>;
}

export const AlgoComparisonColumns: ColumnDef<AlgorithmResult>[] = [
    {
        id: "No.",
        header: "#",
        cell: ({ row }) => {
            return <div className="text-center">{Number(row.id) + 1}</div>;
        },
    },
    {
        accessorKey: "algorithm",
        header: "Algorithm",
        cell: ({ row }) => {
            const algo = row.original.algorithm;
            switch (algo) {
                case "greedy_search":
                    return <div className="text-center">Greedy Search</div>;
                case "h1":
                    return <div className="text-center">H1</div>;
                case "bottom_left_fill":
                    return <div className="text-center">Bottom Left Fit</div>;
                case "extreme_point":
                    return <div className="text-center">Extreme Point</div>;
                case "grasp_vnd":
                    return <div className="text-center">GRASP/VND</div>;
            }
        },
    },
    {
        accessorKey: "volume_utilization",
        header: "Volume Utilization",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const value = row.original.volume_utilization;
            return <div className="text-center">{value} %</div>;
        },
    },
    {
        accessorKey: "weight_utilization",
        header: "Weight Utilization",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const value = (
                (row.original.weight_utilization ?? 0) * 100
            ).toFixed(2);
            return <div className="text-center">{value} %</div>;
        },
    },
    {
        accessorKey: "items_packed",
        header: "Items Packed",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const items_packed = row.original.items_packed;
            const total = row.original.items_total;
            return (
                <div className="text-center">
                    {items_packed} / {total}
                </div>
            );
        },
    },
    {
        accessorKey: "execution_time_ms",
        header: "Execution Time",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const execution_time = row.original.execution_time_ms;
            if (execution_time >= 1000) {
                return (
                    <div className="text-center">
                        {execution_time / 1000 >= 60
                            ? (execution_time / 1000 / 60).toFixed(2) + " min"
                            : (execution_time / 1000).toFixed(2) + " s"}
                    </div>
                );
            }
            return <div className="text-center">{execution_time} ms</div>;
        },
    },
    // --- New validation columns ---
    {
        id: "lifo",
        header: "LIFO",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            return (
                <ValidationBadge
                    ok={row.original.lifo_ok}
                    label="LIFO"
                    detail={row.original.lifo_violations}
                    explanation="Last-In-First-Out compliance. Items for earlier stops must be reachable without moving items for later stops. The number shown is the count of blocking pairs."
                />
            );
        },
    },
    {
        id: "support",
        header: "Support",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const ratio = row.original.avg_support_ratio;
            const ratioPct =
                ratio != null ? `${(ratio * 100).toFixed(0)}%` : "—";
            return (
                <ValidationBadge
                    ok={row.original.support_ok}
                    label="Support"
                    detail={ratioPct}
                    explanation={`Every placed item has enough of its base resting on the floor or on other items. Average support is ${ratioPct} across all placed items.`}
                />
            );
        },
    },
    {
        id: "fragility",
        header: "Fragility",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            return (
                <ValidationBadge
                    ok={row.original.fragility_ok}
                    label="Fragility"
                    detail={row.original.fragility_violations}
                    explanation="No fragile or non-stackable item has too much weight loaded on top of it. The number shown is the count of crushed items."
                />
            );
        },
    },
    {
        id: "cog",
        header: "Balance",
        cell: ({ row }) => {
            if (row.original.status === "failed") return <FailedPlaceholder />;
            const ratio = row.original.cog_ratio;
            const ratioPct =
                ratio != null ? `${(ratio * 100).toFixed(0)}%` : "—";
            return (
                <ValidationBadge
                    ok={row.original.cog_ok}
                    label="CoG"
                    detail={ratioPct}
                    explanation={`Load's center of gravity sits within the acceptable zone along the cargo bay length. Current CoG is at ${ratioPct} from the cab wall.`}
                />
            );
        },
    },
    // --- End validation columns ---
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            switch (status) {
                case "completed":
                    return (
                        <div className="text-center">
                            <Badge className="bg-green-400/10 text-green-400">
                                Completed
                            </Badge>
                        </div>
                    );
                case "running":
                    return (
                        <div className="text-center">
                            <Badge>Running</Badge>
                        </div>
                    );
                case "failed":
                    return (
                        <div className="text-center">
                            <Badge variant={"destructive"}>Failed</Badge>
                        </div>
                    );
            }
        },
    },
];
