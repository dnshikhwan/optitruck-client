import { AlgoComparisonDataTable } from "@/components/tables/algo_comparison/data-table";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import apiFetch from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import type { DeliveryJob } from "@/interfaces/deliveryJob";
import { DashboardLayout } from "../../../../../../layouts";
import { createAlgoComparisonColumns } from "@/components/tables/algo_comparison/columns";
import { CustomSpinner } from "@/components/custom-spinner";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/delivery-jobs-result/$id",
)({
    component: DeliveryJobResultPage,
});

function DeliveryJobResultPage() {
    const { t } = useTranslation();
    const { id } = Route.useParams();
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({
        contentRef,
        pageStyle: `@media print {
        .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 15mm; }
        table { width: 100% !important; table-layout: fixed !important; font-size: 10px !important; }
        th, td { word-break: break-word !important; padding: 4px !important; }
        .break-before-page { break-before: page !important; }
        .recharts-wrapper { overflow: visible !important; }
        .recharts-surface { width: 100% !important; height: 100% !important; }
    }`,
    });
    const [selectedAlgo, setSelectedAlgo] = useState("grasp_vnd");

    const { data: deliveryJob, isLoading } = useQuery<any, Error, DeliveryJob>({
        queryKey: [`delivery-job-${id}`],
        queryFn: async () => {
            const res = await apiFetch(`/delivery-jobs/${id}`);
            if (!res.ok) throw new Error("FETCH_FAILED");
            return res.json();
        },
        select: (response) => response.data,
    });

    if (isLoading || !deliveryJob)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );

    const completedResults = deliveryJob.packingJob.algorithmResults.filter(
        (r) => r.status === "completed",
    );

    const fastestResult =
        completedResults.length > 0
            ? completedResults.reduce((fastest, current) =>
                  parseFloat(current.execution_time_ms) <
                  parseFloat(fastest.execution_time_ms)
                      ? current
                      : fastest,
              )
            : null;

    const fullyCompliantResults = completedResults.filter(
        (r) => r.lifo_ok && r.support_ok && r.fragility_ok && r.cog_ok,
    );

    const candidatePool =
        fullyCompliantResults.length > 0
            ? fullyCompliantResults
            : completedResults;

    const bestResult = candidatePool.reduce(
        (best, current) =>
            parseFloat(current.volume_utilization) >
            parseFloat(best.volume_utilization)
                ? current
                : best,
        candidatePool[0],
    );

    const successCount = completedResults.length;
    const totalCount = deliveryJob.packingJob.algorithmResults.length;
    const failedCount = deliveryJob.packingJob.algorithmResults.filter(
        (r) => r.status === "failed",
    ).length;

    const chartData = completedResults.map((result) => ({
        algorithm: result.algorithm.replace(/_/g, " ").toUpperCase(),
        volume_utilization: parseFloat(result.volume_utilization).toFixed(2),
        execution_time_ms: parseFloat(result.execution_time_ms),
        lifo_violations: result.lifo_violations,
        fragility_violations: result.fragility_violations,
        support_failed: result.support_ok ? 0 : 1,
        cog_failed: result.cog_ok ? 0 : 1,
        all_ok:
            result.lifo_ok &&
            result.support_ok &&
            result.fragility_ok &&
            result.cog_ok,
    }));

    const chartConfig = {
        volume_utilization: {
            label: t("chart.volumeUtilisation"),
            color: "var(--chart-1)",
        },
        execution_time_ms: {
            label: t("chart.executionTime"),
            color: "var(--chart-2)",
        },
        lifo_violations: {
            label: t("chart.lifoViolations"),
            color: "var(--chart-3)",
        },
        fragility_violations: {
            label: t("chart.fragilityViolations"),
            color: "var(--chart-4)",
        },
    };

    return (
        <DashboardLayout>
            <div
                ref={contentRef}
                className="flex items-stretch justify-center w-full min-h-screen"
            >
                <Card className="flex-1 w-full border-none shadow-none">
                    <CardHeader className="no-print">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-col">
                                <CardTitle>{t("header.title")}</CardTitle>
                                <CardDescription>
                                    {t("header.description")}
                                </CardDescription>
                            </div>
                            <Button onClick={reactToPrintFn}>
                                <Printer /> {t("header.printButton")}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col">
                        <Card className="print:border-none print:shadow-none">
                            <CardHeader>
                                <div className="flex flex-col gap-1 mb-2">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                        <CardTitle>
                                            {t("report.title")}
                                        </CardTitle>
                                        <span className="text-muted-foreground">
                                            ·
                                        </span>
                                        <CardTitle>OptiTruck</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {t("report.subtitle")}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <CardTitle>
                                        DJ-
                                        {format(
                                            deliveryJob.createdAt || "",
                                            "yyyy",
                                        )}
                                        -{id.slice(0, 5).toUpperCase()}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("report.generatedAt")}{" "}
                                        {format(
                                            Date.now(),
                                            "dd MMMM yyyy HH:mm:ss",
                                        )}
                                    </CardDescription>
                                </div>
                                <CardDescription>
                                    {t("report.subtitle")}
                                </CardDescription>

                                {/* Meta cards — 2 cols mobile, 3 sm, 5 xl */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 print:grid-cols-5 gap-3 mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                {t("report.meta.shipmentId", {
                                                    count: deliveryJob.shipments
                                                        .length,
                                                })}
                                            </CardDescription>
                                            <CardTitle>
                                                <div className="flex flex-col gap-1">
                                                    {deliveryJob.shipments.map(
                                                        (shipment, index) => (
                                                            <CardTitle
                                                                key={index}
                                                            >
                                                                SHP-
                                                                {format(
                                                                    shipment.createdAt,
                                                                    "yyyy",
                                                                )}
                                                                -
                                                                {shipment.id
                                                                    .substring(
                                                                        0,
                                                                        6,
                                                                    )
                                                                    .toUpperCase()}
                                                            </CardTitle>
                                                        ),
                                                    )}
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                {t("report.meta.vehicle")}
                                            </CardDescription>
                                            <CardTitle>
                                                {deliveryJob.truck.model}
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                {t("report.meta.dimensions")}
                                            </CardDescription>
                                            <CardTitle>
                                                {deliveryJob.truck.length_cm +
                                                    " × " +
                                                    deliveryJob.truck.width_cm +
                                                    " × " +
                                                    deliveryJob.truck
                                                        .height_cm}{" "}
                                                cm
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                {t("report.meta.volume")}
                                            </CardDescription>
                                            <CardTitle>
                                                {(
                                                    (deliveryJob.truck
                                                        .length_cm *
                                                        deliveryJob.truck
                                                            .width_cm *
                                                        deliveryJob.truck
                                                            .height_cm) /
                                                    1000000
                                                ).toFixed(2)}{" "}
                                                m³
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                {t("report.meta.bestAlgorithm")}
                                            </CardDescription>
                                            <CardTitle className="uppercase">
                                                {bestResult?.algorithm.replace(
                                                    /_/g,
                                                    " ",
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                    </Card>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Summary */}
                                <Card className="border-none shadow-none">
                                    <CardHeader>
                                        <CardTitle>
                                            {t("summary.title")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 print:grid-cols-5 gap-3">
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                    {t(
                                                        "summary.bestUtilisation",
                                                    )}
                                                </CardDescription>
                                                <CardTitle>
                                                    {Number(
                                                        bestResult?.volume_utilization,
                                                    ).toFixed(2)}{" "}
                                                    %
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                    {t("summary.itemsPacked")}
                                                </CardDescription>
                                                <CardTitle>
                                                    {bestResult?.items_packed} /{" "}
                                                    {bestResult?.items_total}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                    {t(
                                                        "summary.fastestAlgorithm",
                                                    )}
                                                </CardDescription>
                                                <CardTitle className="uppercase">
                                                    {fastestResult?.algorithm.replace(
                                                        /_/g,
                                                        " ",
                                                    ) ?? "—"}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                    {t(
                                                        "summary.algorithmsEvaluated",
                                                    )}
                                                </CardDescription>
                                                <CardTitle>
                                                    {successCount}/{totalCount}
                                                    {failedCount > 0 && (
                                                        <span className="text-destructive text-sm font-normal ml-2">
                                                            {t(
                                                                "summary.failed",
                                                                {
                                                                    count: failedCount,
                                                                },
                                                            )}
                                                        </span>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="font-heading uppercase tracking-widest text-xs">
                                                    {t(
                                                        "summary.fullyCompliant",
                                                    )}
                                                </CardDescription>
                                                <CardTitle>
                                                    {
                                                        fullyCompliantResults.length
                                                    }
                                                    /{successCount}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    {t(
                                                        "summary.fullyCompliantHelper",
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </CardContent>
                                </Card>

                                <Separator />

                                {/* Comparison table */}
                                <Card className="border-none shadow-none">
                                    <CardHeader>
                                        <CardTitle>
                                            {t("comparison.title")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <AlgoComparisonDataTable
                                            columns={createAlgoComparisonColumns(
                                                t,
                                            )}
                                            data={deliveryJob.packingJob.algorithmResults.map(
                                                (r) => ({
                                                    ...r,
                                                    volume_utilization:
                                                        parseFloat(
                                                            r.volume_utilization,
                                                        ),
                                                    weight_utilization:
                                                        r.weight_utilization
                                                            ? parseFloat(
                                                                  r.weight_utilization,
                                                              )
                                                            : null,
                                                    execution_time_ms:
                                                        parseFloat(
                                                            r.execution_time_ms,
                                                        ),
                                                    avg_support_ratio:
                                                        r.avg_support_ratio
                                                            ? parseFloat(
                                                                  r.avg_support_ratio,
                                                              )
                                                            : null,
                                                    cog_ratio: r.cog_ratio
                                                        ? parseFloat(
                                                              r.cog_ratio,
                                                          )
                                                        : null,
                                                }),
                                            )}
                                            selectedAlgo={selectedAlgo}
                                            onSelectAlgo={setSelectedAlgo}
                                        />
                                    </CardContent>
                                </Card>

                                <Separator />

                                {/* Performance charts — 1 col mobile, 2 md, 3 lg */}
                                <Card className="border-none shadow-none break-before-page print:mt-5">
                                    <CardHeader>
                                        <CardTitle>
                                            {t("performance.title")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-3">
                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="uppercase tracking-widest text-xs">
                                                    {t("performance.fig1")}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer
                                                    config={chartConfig}
                                                    className="w-full min-h-[200px] max-h-[300px]"
                                                >
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="algorithm"
                                                            tickMargin={10}
                                                            axisLine={false}
                                                            tickFormatter={(
                                                                v,
                                                            ) => v.slice(0, 5)}
                                                        />
                                                        <YAxis
                                                            tickLine={false}
                                                            axisLine={false}
                                                            domain={[0, "auto"]}
                                                        />
                                                        <ChartTooltip
                                                            cursor={false}
                                                            content={
                                                                <ChartTooltipContent />
                                                            }
                                                        />
                                                        <Bar
                                                            dataKey="volume_utilization"
                                                            fill="var(--color-volume_utilization)"
                                                            radius={8}
                                                        >
                                                            <LabelList
                                                                position="top"
                                                                offset={12}
                                                                className="fill-foreground"
                                                                fontSize={11}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardDescription className="uppercase tracking-widest text-xs">
                                                    {t("performance.fig2")}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer
                                                    config={chartConfig}
                                                    className="w-full min-h-[200px] max-h-[300px]"
                                                >
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="algorithm"
                                                            tickLine={false}
                                                            tickMargin={10}
                                                            axisLine={false}
                                                            tickFormatter={(
                                                                v,
                                                            ) => v.slice(0, 5)}
                                                        />
                                                        <YAxis
                                                            tickLine={false}
                                                            axisLine={false}
                                                            domain={[0, "auto"]}
                                                        />
                                                        <ChartTooltip
                                                            cursor={false}
                                                            content={
                                                                <ChartTooltipContent />
                                                            }
                                                        />
                                                        <Bar
                                                            dataKey="execution_time_ms"
                                                            fill="var(--color-execution_time_ms)"
                                                            radius={8}
                                                        >
                                                            <LabelList
                                                                position="top"
                                                                offset={12}
                                                                className="fill-foreground"
                                                                fontSize={11}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>

                                        <Card className="break-before-page print:mt-5">
                                            <CardHeader>
                                                <CardDescription className="uppercase tracking-widest text-xs">
                                                    {t("performance.fig3")}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <ChartContainer
                                                    config={chartConfig}
                                                    className="w-full min-h-[200px] max-h-[300px]"
                                                >
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid
                                                            vertical={false}
                                                        />
                                                        <XAxis
                                                            dataKey="algorithm"
                                                            tickLine={false}
                                                            tickMargin={10}
                                                            axisLine={false}
                                                            tickFormatter={(
                                                                v,
                                                            ) => v.slice(0, 5)}
                                                        />
                                                        <YAxis
                                                            tickLine={false}
                                                            axisLine={false}
                                                            domain={[0, "auto"]}
                                                            allowDecimals={
                                                                false
                                                            }
                                                        />
                                                        <ChartTooltip
                                                            cursor={false}
                                                            content={
                                                                <ChartTooltipContent />
                                                            }
                                                        />
                                                        <Bar
                                                            dataKey="lifo_violations"
                                                            stackId="violations"
                                                            fill="var(--color-lifo_violations)"
                                                            radius={[
                                                                0, 0, 0, 0,
                                                            ]}
                                                        />
                                                        <Bar
                                                            dataKey="fragility_violations"
                                                            stackId="violations"
                                                            fill="var(--color-fragility_violations)"
                                                            radius={[
                                                                8, 8, 0, 0,
                                                            ]}
                                                        />
                                                    </BarChart>
                                                </ChartContainer>
                                            </CardContent>
                                        </Card>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
