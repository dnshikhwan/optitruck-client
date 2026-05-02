import { LabelList, Pie, PieChart } from "recharts";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

export const description = "A pie chart with a label list";

const chartData = [
    { status: "active", total: 275, fill: "var(--color-active)" },
    {
        status: "in_maintenance",
        total: 200,
        fill: "var(--color-in_maintenance)",
    },
    {
        status: "out_of_service",
        total: 187,
        fill: "var(--color-out_of_service)",
    },
];

const chartConfig = {
    total: {
        label: "Total",
    },
    active: {
        label: "Active",
        color: "var(--chart-1)",
    },
    in_maintenance: {
        label: "In Maintenance",
        color: "var(--chart-2)",
    },
    out_of_service: {
        label: "Out Of Service",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

export function ChartPieLabelList() {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    nameKey="total"
                                    hideLabel
                                />
                            }
                        />
                        <Pie data={chartData} dataKey="total">
                            <LabelList
                                dataKey="status"
                                className="fill-background"
                                stroke="none"
                                fontSize={12}
                                position="inside"
                                formatter={(value: any) =>
                                    chartConfig[
                                        value as keyof typeof chartConfig
                                    ]?.label
                                }
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="text-muted-foreground leading-none">
                    {t("showing_truck_status_summary")}
                </div>
            </CardFooter>
        </Card>
    );
}
