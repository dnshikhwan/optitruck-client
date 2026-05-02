import { createFileRoute } from "@tanstack/react-router";
import { CircleCheck, ClockAlert, TruckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChartPieLabelList } from "@/components/charts/chart-pie-label-list";
import { DashboardLayout } from "../../../../../layouts";
import { useQuery } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import { Spinner } from "@/components/ui/spinner";
import { ShipmentDataTable } from "@/components/tables/shipments/data-table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { Shipment } from "@/interfaces/shipments";
import {
    Stat,
    StatDescription,
    StatIndicator,
    StatLabel,
    StatValue,
} from "@/components/ui/stat";
import type { Truck } from "@/interfaces/trucks";
import { useMemo } from "react";
import { createShipmentColumns } from "@/components/tables/shipments/columns";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/_manager/manager/")({
    component: IndexDashboard,
    staticData: {
        breadcrumb: "Overview",
    },
});

interface PackingEffiency {
    result: string;
}

function IndexDashboard() {
    const { t } = useTranslation();
    const { auth } = Route.useRouteContext();
    const shipmentsColumns = useMemo(() => createShipmentColumns(t), [t]);

    const { data: shipments = [], isLoading } = useQuery<
        any,
        Error,
        Shipment[]
    >({
        queryKey: ["shipments"],
        queryFn: async () => {
            const res = await apiFetch("/shipments");
            if (!res.ok) throw new Error("Error fetching shipments");
            return res.json();
        },
        select: (response) => response.data,
    });

    const { data: trucks = [] } = useQuery<any, Error, Truck[]>({
        queryKey: ["trucks"],
        queryFn: async () => {
            const res = await apiFetch("/trucks");
            if (!res.ok) throw new Error("Error fetching trucks");
            return res.json();
        },
        select: (response) => response.data,
    });

    const { data: packingEfficiency } = useQuery<any, Error, PackingEffiency>({
        queryKey: ["packingEfficiency"],
        queryFn: async () => {
            const res = await apiFetch("/packing/efficiency-stats");
            if (!res.ok) throw new Error("Error fetching packing efficiency");
            return res.json();
        },
        select: (response) => response.data,
    });

    const availableTrucks = trucks.filter((truck) => truck.status === "active");
    const unassignedShipments = shipments.filter(
        (shipment) => shipment.status === "pending",
    );

    const StatisticsCardData = useMemo(
        () => [
            {
                icon: <TruckIcon className="size-4" />,
                value: "1",
                title: t("total_delivery_jobs"),
                description: t("daily_delivery_jobs_desc"),
            },
            {
                icon: <CircleCheck className="size-4" />,
                value: String(unassignedShipments.length),
                title: t("unassigned_shipments"),
                description: t("awaiting_delivery_job"),
            },
            {
                icon: <TruckIcon className="size-4" />,
                value: String(availableTrucks.length),
                title: t("active_trucks"),
                description: t("ready_to_use_trucks"),
            },
            {
                icon: <ClockAlert className="size-4" />,
                value: packingEfficiency?.result + " %",
                title: t("avg_packing_efficiency"),
                description: t("across_all_jobs"),
            },
        ],
        [
            t,
            unassignedShipments.length,
            availableTrucks.length,
            packingEfficiency,
        ],
    );
    if (isLoading) return <Spinner />;

    return (
        <DashboardLayout>
            <div>
                <h1 className="scroll-m-20 font-heading font-extrabold text-xl">
                    {t("welcome_back")}, {auth.user?.first_name}{" "}
                    {auth.user?.last_name}
                </h1>
                <p>{format(new Date(), "eeee, dd MMMM yyyy")}</p>
            </div>
            <div className="grid auto-rows-min md:grid-cols-4 gap-4">
                {StatisticsCardData.map((card, index) => (
                    <Stat key={index}>
                        <StatLabel className="text-xs uppercase tracking-widest">
                            {card.title}
                        </StatLabel>
                        <StatValue>{card.value}</StatValue>
                        <StatIndicator variant="icon" color="info">
                            {card.icon}
                        </StatIndicator>
                        <StatDescription>{card.description}</StatDescription>
                    </Stat>
                ))}
            </div>
            <div className="flex items-stretch gap-4">
                <Card className="flex-1 h-full">
                    <CardHeader>
                        <CardTitle>{t("latest_shipment")}</CardTitle>
                        <CardDescription>{t("showing_last_5")}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-full">
                        <ShipmentDataTable
                            columns={shipmentsColumns}
                            data={shipments}
                            pageSize={5}
                        />
                    </CardContent>
                </Card>
                <Card className="w-1/3 flex flex-col">
                    <CardHeader>
                        <CardTitle>{t("truck_status")}</CardTitle>
                        <CardDescription>
                            {t("january_june_2026")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-full">
                        <ChartPieLabelList />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
