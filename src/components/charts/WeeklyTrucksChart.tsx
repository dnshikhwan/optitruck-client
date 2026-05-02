import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "../ui/chart";
import { useWeeklyTruckStats } from "@/hooks/useWeeklyTruckStats";

const chartConfig = {
    count: {
        label: "Total Trucks",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

export function WeeklyTrucksChart() {
    const { data, isLoading } = useWeeklyTruckStats();

    if (isLoading)
        return <div className="h-16 animate-pulse bg-muted rounded" />;

    return (
        <ChartContainer config={chartConfig} className="h-28 w-full">
            <AreaChart
                data={data}
                margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    tick={{ fontSize: 10 }}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                    dataKey="count"
                    type="natural"
                    fill="var(--color-count)"
                    fillOpacity={0.3}
                    stroke="var(--color-count)"
                />
            </AreaChart>
        </ChartContainer>
    );
}
