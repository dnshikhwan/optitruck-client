import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "../../../../../../layouts";
import {
    AlertCircle,
    Box,
    Boxes,
    Check,
    CheckCheck,
    Cuboid,
    Dot,
    Loader,
    MapPin,
    Package,
    Truck,
    XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from "@/components/ui/card";
import { ShipmentItemsDataTable } from "@/components/tables/shipment_items.tsx/data-table";
import { shipmentItemsColumns } from "@/components/tables/shipment_items.tsx/columns";
import type { Shipment } from "@/interfaces/shipments";
import {
    Stat,
    StatIndicator,
    StatLabel,
    StatValue,
} from "@/components/ui/stat";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/shipments/$id",
)({
    component: ShipmentDetails,
    staticData: {
        breadcrumb: "Shipment Detail",
    },
});

function ShipmentDetails() {
    const { id } = Route.useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: shipment, isLoading } = useQuery<any, Error, Shipment>({
        queryKey: [`shipment-${id}`],
        queryFn: async () => {
            const res = await apiFetch(`/shipments/${id}`);
            if (!res.ok) throw new Error("Error fetching trucks");
            return res.json();
        },
        select: (response) => response.data,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner />
            </div>
        );
    }

    const shippingItemsQuantity = shipment?.shipment_items.reduce(
        (total, item) => total + item.quantity,
        0,
    );
    const totalItemsWeight = shipment?.shipment_items.reduce(
        (total, item) => total + item.weight_kg * item.quantity,
        0,
    );
    const totalItemsVolume = shipment?.shipment_items.reduce(
        (total, item) =>
            total + item.length_cm * item.height_cm * item.width_cm,
        0,
    );

    const statusBadgeConfig = {
        draft: {
            label: t("status_draft"),
            icon: Boxes,
            className: "bg-gray-400/10 text-gray-500",
        },
        pending: {
            label: t("status_pending"),
            icon: AlertCircle,
            className: "bg-yellow-400/10 text-yellow-500",
        },
        optimizing: {
            label: t("status_optimizing"),
            icon: Loader,
            className: "bg-purple-400/10 text-purple-500",
        },
        ready: {
            label: t("status_ready"),
            icon: Check,
            className: "bg-green-400/10 text-green-500",
        },
        assigned: {
            label: t("status_assigned"),
            icon: Truck,
            className: "bg-blue-400/10 text-blue-500",
        },
        in_progress: {
            label: t("status_in_progress"),
            icon: Package,
            className: "bg-orange-400/10 text-orange-500",
        },
        delivered: {
            label: t("status_delivered"),
            icon: CheckCheck,
            className: "bg-emerald-400/10 text-emerald-500",
        },
        cancelled: {
            label: t("status_cancelled"),
            icon: XCircle,
            className: "bg-red-400/10 text-red-500",
        },
    };

    // Grab the delivery job from the shipment if it exists.
    // The backend returns this as "deliveryJob" (camelCase) nested in the shipment response.
    const deliveryJob = shipment?.deliveryJob;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                            {t("shipment-details")} · {shipment?.name} · (SHP-
                            {format(shipment?.createdAt || "", "yyyy")}-
                            {id.slice(0, 5).toUpperCase()})
                        </h1>
                        {shipment?.status &&
                            (() => {
                                const config =
                                    statusBadgeConfig[shipment.status];
                                const Icon = config.icon;
                                return (
                                    <Badge className={config.className}>
                                        <Icon /> {config.label}
                                    </Badge>
                                );
                            })()}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm font-semibold tracking-tight">
                    <span>
                        {t("created")}{" "}
                        {format(shipment?.createdAt || "", "dd MMMM yyyy")}
                    </span>
                    <Dot className="shrink-0" />
                    <span>
                        {t("drop_point_label")}: {shipment?.drop_point || "—"}
                    </span>
                    {shipment && (
                        <>
                            <Dot className="shrink-0" />
                            <span>
                                {t("scheduled_at_label")}:{" "}
                                {format(
                                    shipment.scheduled_at,
                                    "dd MMMM yyyy",
                                ) || "—"}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Stats — 1 col mobile, 3 col sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Stat>
                    <StatLabel>{t("total_items")}</StatLabel>
                    <StatValue>{shippingItemsQuantity}</StatValue>
                    <StatIndicator color="info">
                        <Box />
                    </StatIndicator>
                </Stat>
                <Stat>
                    <StatLabel>{t("total_volume")}</StatLabel>
                    <StatValue>{totalItemsVolume} cm³</StatValue>
                    <StatIndicator color="info">
                        <Cuboid />
                    </StatIndicator>
                </Stat>
                <Stat>
                    <StatLabel>{t("total_weight")}</StatLabel>
                    <StatValue>{totalItemsWeight} kg</StatValue>
                    <StatIndicator color="info">
                        <Box />
                    </StatIndicator>
                </Stat>
            </div>

            {/* Main cards — stacked on mobile, side by side on lg+ */}
            <div className="flex flex-col lg:flex-row items-stretch w-full gap-4">
                <Card className="w-full lg:w-1/2 dark:bg-muted/50">
                    <CardHeader>
                        <CardDescription className="flex items-center justify-between text-xs tracking-widest">
                            {t("shipment_items").toUpperCase()}
                            <Badge className="dark:bg-primary/40 dark:text-primary-foreground/80">
                                {t("items_count", {
                                    count: shippingItemsQuantity,
                                })}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ShipmentItemsDataTable
                            columns={shipmentItemsColumns}
                            data={shipment?.shipment_items || []}
                        />
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-0 dark:bg-muted/50">
                    <CardHeader>
                        <CardDescription className="text-xs uppercase tracking-widest flex items-center gap-2">
                            {t("delivery_job")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-full flex flex-col">
                        {deliveryJob ? (
                            <DeliveryJobDetails
                                deliveryJob={deliveryJob}
                                dropPoint={shipment?.drop_point}
                                lat={shipment?.lat}
                                lng={shipment?.lng}
                            />
                        ) : (
                            <div className="flex flex-col border border-dashed p-10 items-center justify-center gap-4 flex-1 text-center">
                                <div className="bg-gray-800 p-3 rounded-full">
                                    <Truck className="text-muted-foreground" />
                                </div>
                                <CardDescription>
                                    {t("shipment_not_in_delivery_job")}
                                </CardDescription>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate({
                                            to: "/manager/delivery-jobs/create",
                                        })
                                    }
                                >
                                    {t("create_delivery_job")}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

// ---------------------------------------------------------------------------
// DeliveryJobDetails — renders when the shipment already belongs to a job.
// Shape matches the actual API response: only id, status, createdAt, updatedAt
// are returned nested inside the shipment. For more details (truck, driver,
// route stops) the user navigates to the full delivery job page.
// ---------------------------------------------------------------------------

type DeliveryJobDetailsProps = {
    deliveryJob: {
        id: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    dropPoint?: string;
    lat?: string;
    lng?: string;
};

function DeliveryJobDetails({
    deliveryJob,
    dropPoint,
    lat,
    lng,
}: DeliveryJobDetailsProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6">
            {/* Job reference ID + status badge */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                    DJ-{deliveryJob.id.slice(0, 8).toUpperCase()}
                </span>
                <Badge className="text-xs capitalize">
                    {deliveryJob.status.replace("_", " ")}
                </Badge>
            </div>

            {/* Key dates */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 rounded-md border p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {t("created")}
                    </p>
                    <p className="text-sm font-semibold">
                        {format(deliveryJob.createdAt, "dd MMM yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(deliveryJob.createdAt, "HH:mm")}
                    </p>
                </div>
                <div className="flex flex-col gap-1 rounded-md border p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {t("last_updated")}
                    </p>
                    <p className="text-sm font-semibold">
                        {format(deliveryJob.updatedAt, "dd MMM yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {format(deliveryJob.updatedAt, "HH:mm")}
                    </p>
                </div>
            </div>

            {/* Drop point — comes from the parent shipment, not the job itself */}
            {dropPoint && (
                <div className="flex items-start gap-3 rounded-md border p-3">
                    <MapPin
                        className="text-muted-foreground shrink-0 mt-0.5"
                        size={16}
                    />
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                            {t("drop_point_label")}
                        </p>
                        <p className="text-sm font-semibold">{dropPoint}</p>
                        {lat && lng && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {parseFloat(lat).toFixed(5)},{" "}
                                {parseFloat(lng).toFixed(5)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Navigate to the full delivery job page for truck/driver/route details */}
            <Button
                variant="outline"
                className="mt-auto"
                onClick={() =>
                    navigate({
                        to: `/manager/delivery-jobs/${deliveryJob.id}`,
                    })
                }
            >
                {t("view_delivery_job")}
            </Button>
        </div>
    );
}
