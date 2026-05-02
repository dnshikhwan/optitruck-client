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
import type { TFunction } from "i18next";

export type AlgorithmResult = {
    algorithm: AlgorithmName;
    status: "running" | "completed" | "failed";
    volume_utilization: number;
    weight_utilization: number | null;
    items_packed: number;
    items_total: number;
    execution_time_ms: number;
    lifo_ok: boolean;
    lifo_violations: number;
    support_ok: boolean;
    avg_support_ratio: number | null;
    fragility_ok: boolean;
    fragility_violations: number;
    cog_ok: boolean;
    cog_ratio: number | null;
};

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

function FailedPlaceholder() {
    return <div className="text-center text-muted-foreground">—</div>;
}

function formatExecutionTime(ms: number, t: TFunction): string {
    if (ms >= 60_000)
        return t("time.min", { value: (ms / 1000 / 60).toFixed(2) });
    if (ms >= 1_000) return t("time.s", { value: (ms / 1000).toFixed(2) });
    return t("time.ms", { value: ms });
}

export function createAlgoComparisonColumns(
    t: TFunction,
): ColumnDef<AlgorithmResult>[] {
    return [
        {
            id: "No.",
            header: t("columns.no"),
            cell: ({ row }) => (
                <div className="text-center">{Number(row.id) + 1}</div>
            ),
        },
        {
            accessorKey: "algorithm",
            header: t("columns.algorithm"),
            cell: ({ row }) => (
                <div className="text-center">
                    {t(`algorithms.${row.original.algorithm}`)}
                </div>
            ),
        },
        {
            accessorKey: "volume_utilization",
            header: t("columns.volumeUtilization"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                return (
                    <div className="text-center">
                        {row.original.volume_utilization} %
                    </div>
                );
            },
        },
        {
            accessorKey: "weight_utilization",
            header: t("columns.weightUtilization"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                const value = (
                    (row.original.weight_utilization ?? 0) * 100
                ).toFixed(2);
                return <div className="text-center">{value} %</div>;
            },
        },
        {
            accessorKey: "items_packed",
            header: t("columns.itemsPacked"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                return (
                    <div className="text-center">
                        {row.original.items_packed} / {row.original.items_total}
                    </div>
                );
            },
        },
        {
            accessorKey: "execution_time_ms",
            header: t("columns.executionTime"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                return (
                    <div className="text-center">
                        {formatExecutionTime(row.original.execution_time_ms, t)}
                    </div>
                );
            },
        },
        {
            id: "lifo",
            header: t("columns.lifo"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                return (
                    <ValidationBadge
                        ok={row.original.lifo_ok}
                        label={t("validation.lifoLabel")}
                        detail={row.original.lifo_violations}
                        explanation={t("validation.lifoExplanation")}
                    />
                );
            },
        },
        {
            id: "support",
            header: t("columns.support"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                const ratio = row.original.avg_support_ratio;
                const ratioPct =
                    ratio != null ? `${(ratio * 100).toFixed(0)}%` : "—";
                return (
                    <ValidationBadge
                        ok={row.original.support_ok}
                        label={t("validation.supportLabel")}
                        detail={ratioPct}
                        explanation={t("validation.supportExplanation", {
                            ratioPct,
                        })}
                    />
                );
            },
        },
        {
            id: "fragility",
            header: t("columns.fragility"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                return (
                    <ValidationBadge
                        ok={row.original.fragility_ok}
                        label={t("validation.fragilityLabel")}
                        detail={row.original.fragility_violations}
                        explanation={t("validation.fragilityExplanation")}
                    />
                );
            },
        },
        {
            id: "cog",
            header: t("columns.balance"),
            cell: ({ row }) => {
                if (row.original.status === "failed")
                    return <FailedPlaceholder />;
                const ratio = row.original.cog_ratio;
                const ratioPct =
                    ratio != null ? `${(ratio * 100).toFixed(0)}%` : "—";
                return (
                    <ValidationBadge
                        ok={row.original.cog_ok}
                        label={t("validation.cogLabel")}
                        detail={ratioPct}
                        explanation={t("validation.cogExplanation", {
                            ratioPct,
                        })}
                    />
                );
            },
        },
        {
            accessorKey: "status",
            header: t("columns.status"),
            cell: ({ row }) => {
                const status = row.original.status;
                switch (status) {
                    case "completed":
                        return (
                            <div className="text-center">
                                <Badge className="bg-green-400/10 text-green-400">
                                    {t("status_algo.completed")}
                                </Badge>
                            </div>
                        );
                    case "running":
                        return (
                            <div className="text-center">
                                <Badge>{t("status_algo.running")}</Badge>
                            </div>
                        );
                    case "failed":
                        return (
                            <div className="text-center">
                                <Badge variant="destructive">
                                    {t("status_algo.failed")}
                                </Badge>
                            </div>
                        );
                }
            },
        },
    ];
}
