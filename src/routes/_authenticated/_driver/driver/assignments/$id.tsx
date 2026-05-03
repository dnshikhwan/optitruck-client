import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import apiFetch from "@/utils/apiFetch";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "../../../../../../layouts";
import {
    AssignmentStatus,
    type DriverAssignmentDetail,
} from "@/interfaces/driverAssignment";
import type { Shipment, ShipmentItems } from "@/interfaces/shipments";
import type {
    PackingResult,
    PlacedItem as ViewerPlacedItem,
    TruckDimensions,
} from "@/components/3DPackingViewer";
import { RouteMap } from "@/components/RouteMap";
import {
    ChevronLeft,
    Truck,
    MapPin,
    Package,
    CheckCircle2,
    Circle,
    ArrowLeftRight,
} from "lucide-react";
import { PackingViewer } from "@/components/3DPackingViewer";
import { CustomSpinner } from "@/components/custom-spinner";

export const Route = createFileRoute(
    "/_authenticated/_driver/driver/assignments/$id",
)({
    component: AssignmentDetailPage,
});

const toNum = (val: string | number): number =>
    typeof val === "string" ? parseFloat(val) : val;
// ─── Status config ─────────────────────────────────────────────────────────────

const STEPS: AssignmentStatus[] = [
    AssignmentStatus.ACKNOWLEDGED,
    AssignmentStatus.LOADING,
    AssignmentStatus.IN_TRANSIT,
    AssignmentStatus.DELIVERED,
];

const ACTION_LABELS: Partial<Record<AssignmentStatus, string>> = {
    [AssignmentStatus.ACKNOWLEDGED]: "driver.detail.action.start_loading",
    [AssignmentStatus.LOADING]: "driver.detail.action.depart",
    [AssignmentStatus.IN_TRANSIT]: "driver.detail.action.mark_delivered",
};

const ACTION_CLASSES: Partial<Record<AssignmentStatus, string>> = {
    [AssignmentStatus.ACKNOWLEDGED]:
        "bg-primary hover:bg-primary/90 text-primary-foreground",
    [AssignmentStatus.LOADING]: "bg-amber-500 hover:bg-amber-600 text-white",
    [AssignmentStatus.IN_TRANSIT]:
        "bg-emerald-500 hover:bg-emerald-600 text-white",
};

const NEXT_STATUS: Partial<Record<AssignmentStatus, AssignmentStatus>> = {
    [AssignmentStatus.ACKNOWLEDGED]: AssignmentStatus.LOADING,
    [AssignmentStatus.LOADING]: AssignmentStatus.IN_TRANSIT,
    [AssignmentStatus.IN_TRANSIT]: AssignmentStatus.DELIVERED,
};

const STATUS_BADGE: Record<AssignmentStatus, string> = {
    [AssignmentStatus.ASSIGNED]:
        "bg-orange-500/10 text-orange-500 border-orange-500/25",
    [AssignmentStatus.ACKNOWLEDGED]:
        "bg-primary/10 text-primary border-primary/20",
    [AssignmentStatus.LOADING]:
        "bg-amber-500/10 text-amber-500 border-amber-500/20",
    [AssignmentStatus.IN_TRANSIT]:
        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    [AssignmentStatus.DELIVERED]:
        "bg-muted text-muted-foreground border-border",
    [AssignmentStatus.CANCELLED]:
        "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABEL: Record<AssignmentStatus, string> = {
    [AssignmentStatus.ASSIGNED]: "driver.active_assignments.status.ASSIGNED",
    [AssignmentStatus.ACKNOWLEDGED]:
        "driver.active_assignments.status.ACKNOWLEDGED",
    [AssignmentStatus.LOADING]: "driver.active_assignments.status.LOADING",
    [AssignmentStatus.IN_TRANSIT]:
        "driver.active_assignments.status.IN_TRANSIT",
    [AssignmentStatus.DELIVERED]: "driver.active_assignments.status.DELIVERED",
    [AssignmentStatus.CANCELLED]: "driver.active_assignments.status.CANCELLED",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPanelLayout(
    status: AssignmentStatus,
): "equal" | "packingFirst" | "routeFirst" {
    if (status === AssignmentStatus.LOADING) return "packingFirst";
    if (status === AssignmentStatus.IN_TRANSIT) return "routeFirst";
    return "equal";
}

interface StopEntry {
    index: number;
    lat: number;
    lng: number;
    dropPoint: string;
    shipmentId: string;
    shipment: Shipment | null;
}

function buildStops(assignment: DriverAssignmentDetail): StopEntry[] {
    const { stopSequence } = assignment.deliveryJob.routingJob
        ?.routingResult ?? {
        stopSequence: [],
    };
    const shipmentMap = new Map<string, Shipment>(
        assignment.deliveryJob.shipments.map((s: Shipment) => [s.id, s]),
    );
    return stopSequence.map((stop, index: number) => ({
        index,
        lat: stop.lat,
        lng: stop.lng,
        dropPoint: stop.dropPoint,
        shipmentId: stop.shipmentId,
        shipment: shipmentMap.get(stop.shipmentId) ?? null,
    }));
}

// Converts backend PlacedItem[] (with string decimals + nested shipment_item)
// into the shape PackingViewer expects (number fields + flat PackingItem).
//
// Also enriches each item with shipmentId, shipmentName, and stopIndex so
// the viewer's shipment legend and color grouping work correctly.
function buildPackingResult(
    assignment: DriverAssignmentDetail,
): PackingResult | undefined {
    const selectedResult = assignment.deliveryJob.selectedResult;
    if (!selectedResult || !selectedResult.placedItems?.length)
        return undefined;

    // Map each shipment_item id → { shipmentId, shipmentName }
    const itemToShipment = new Map<
        string,
        { shipmentId: string; shipmentName: string }
    >();
    assignment.deliveryJob.shipments.forEach((shipment: Shipment) => {
        shipment.shipment_items.forEach((item: ShipmentItems) => {
            itemToShipment.set(item.id, {
                shipmentId: shipment.id,
                shipmentName: shipment.name,
            });
        });
    });

    // Map shipmentId → stop index so the viewer can label stops
    const shipmentToStopIndex = new Map<string, number>();
    (
        assignment.deliveryJob.routingJob?.routingResult?.stopSequence ?? []
    ).forEach((stop, index) => {
        shipmentToStopIndex.set(stop.shipmentId, index);
    });

    const placedItems: ViewerPlacedItem[] = selectedResult.placedItems.map(
        (p) => {
            const shipmentInfo = itemToShipment.get(p.shipment_item.id);
            return {
                item: {
                    id: p.shipment_item.id,
                    name: p.shipment_item.name,
                    // Viewer expects numbers — backend returns strings from TypeORM decimal
                    length_cm: toNum(p.shipment_item.length_cm),
                    width_cm: toNum(p.shipment_item.width_cm),
                    height_cm: toNum(p.shipment_item.height_cm),
                    weight_kg: String(p.shipment_item.weight_kg),
                    color_hex: p.shipment_item.color_hex,
                    shipmentId: shipmentInfo?.shipmentId ?? "",
                    shipmentName: shipmentInfo?.shipmentName ?? "",
                    stopIndex: shipmentInfo
                        ? (shipmentToStopIndex.get(shipmentInfo.shipmentId) ??
                          0)
                        : 0,
                },
                x_coordinate: parseFloat(p.x),
                y_coordinate: parseFloat(p.y),
                z_coordinate: parseFloat(p.z),
                width_cm: parseFloat(p.width_cm),
                height_cm: parseFloat(p.height_cm),
                length_cm: parseFloat(p.length_cm),
            };
        },
    );

    return {
        placedItems,
        // unpacked_item_ids are just UUIDs — we don't have enough data
        // on the driver page to reconstruct full PackingItem objects for them,
        // so we pass an empty array. The viewer shows "0 unplaced" which is fine.
        unplacedItems: [],
        usedVolumePercent: parseFloat(selectedResult.volume_utilization),
        wastedVolumePercent:
            100 - parseFloat(selectedResult.volume_utilization),
    };
}

// Converts truck string dimensions to numbers for TruckDimensions
function buildTruckDimensions(
    truck: DriverAssignmentDetail["deliveryJob"]["truck"],
): TruckDimensions {
    return {
        length_cm: toNum(truck.length_cm),
        width_cm: toNum(truck.width_cm),
        height_cm: toNum(truck.height_cm),
    };
}

// ─── StatusProgressBar ────────────────────────────────────────────────────────

function StatusProgressBar({ status }: { status: AssignmentStatus }) {
    const { t } = useTranslation();
    const currentIndex = STEPS.indexOf(status);

    return (
        <div className="flex items-start w-full">
            {STEPS.map((step, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                    <div key={step} className="flex items-start flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                            {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : isCurrent ? (
                                <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary/40 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                </div>
                            ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/30" />
                            )}
                            <span
                                className={`text-[10px] text-center leading-tight max-w-14 wrap-break-word ${
                                    isDone
                                        ? "text-emerald-500"
                                        : isCurrent
                                          ? "text-foreground font-medium"
                                          : "text-muted-foreground/40"
                                }`}
                            >
                                {t(STATUS_LABEL[step])}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-px mt-2.5 mx-1 ${
                                    isDone ? "bg-emerald-500/50" : "bg-border"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── RoutePanel ───────────────────────────────────────────────────────────────

interface RoutePanelProps {
    assignment: DriverAssignmentDetail;
    isPrimary: boolean;
}

function RoutePanel({ assignment, isPrimary }: RoutePanelProps) {
    const { t } = useTranslation();
    const stops = buildStops(assignment);
    const distance =
        assignment.deliveryJob.routingJob?.routingResult?.totalDistanceKm;

    const warehouseLat = parseFloat(assignment.company.warehouseLat ?? "0");
    const warehouseLng = parseFloat(assignment.company.warehouseLng ?? "0");
    const hasWarehouse =
        assignment.company.warehouseLat != null &&
        assignment.company.warehouseLng != null;

    return (
        <Card
            className={`flex flex-col h-full ${isPrimary ? "flex-2" : "flex-1"} min-w-0 overflow-hidden`}
        >
            <CardContent className="p-5 flex flex-col gap-4 h-full overflow-hidden">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                        {t("driver.detail.route.title")}
                    </span>
                    {distance && (
                        <div className="flex items-center gap-1.5">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {parseFloat(distance).toFixed(1)} km
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Leaflet map ── */}
                {hasWarehouse && stops.length > 0 ? (
                    <div className="shrink-0">
                        <RouteMap
                            stops={stops}
                            warehouseLat={warehouseLat}
                            warehouseLng={warehouseLng}
                        />
                    </div>
                ) : (
                    <div className="rounded-md bg-muted h-40 flex items-center justify-center text-muted-foreground text-sm shrink-0">
                        {t("driver.detail.route.map_placeholder")}
                    </div>
                )}

                {/* ── Stop list ── */}
                <div className="flex flex-col overflow-y-auto flex-1">
                    {stops.map((stop: StopEntry, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="flex flex-col items-center shrink-0">
                                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mt-0.5">
                                    <span className="text-[10px] font-semibold text-primary">
                                        {i + 1}
                                    </span>
                                </div>
                                {i < stops.length - 1 && (
                                    <div className="w-px flex-1 bg-border my-1 min-h-5" />
                                )}
                            </div>
                            <div className="pb-4 min-w-0">
                                <p className="text-sm font-medium text-foreground leading-tight">
                                    {stop.dropPoint}
                                </p>
                                {stop.shipment && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {t("driver.detail.route.items_count", {
                                            count: stop.shipment.shipment_items
                                                .length,
                                        })}{" "}
                                        · {stop.shipment.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {t("driver.detail.route.warehouse_return")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── PackingPanel ─────────────────────────────────────────────────────────────

interface PackingPanelProps {
    assignment: DriverAssignmentDetail;
    isPrimary: boolean;
}

function PackingPanel({ assignment, isPrimary }: PackingPanelProps) {
    const { t } = useTranslation();
    const stops = buildStops(assignment);
    const [selectedStop, setSelectedStop] = useState<number | null>(null);
    const algo = assignment.deliveryJob.selectedResult;

    // Build the viewer's data shape once — memoized so it doesn't recompute on every render
    const packingResult = useMemo(
        () => buildPackingResult(assignment),
        [assignment],
    );
    const truckDimensions = useMemo(
        () => buildTruckDimensions(assignment.deliveryJob.truck),
        [assignment.deliveryJob.truck],
    );

    const currentStopShipment: Shipment | null =
        selectedStop !== null ? (stops[selectedStop]?.shipment ?? null) : null;

    return (
        <Card
            className={`flex flex-col h-full ${isPrimary ? "flex-2" : "flex-1"} min-w-0 overflow-hidden`}
        >
            <CardContent className="p-5 flex flex-col gap-4 h-full overflow-hidden">
                {/* ── Header ── */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                            {t("driver.detail.packing.title")}
                        </span>
                        {algo && (
                            <Badge variant="outline" className="text-[10px]">
                                {algo.algorithm.toUpperCase()} ·{" "}
                                {parseFloat(algo.volume_utilization).toFixed(1)}
                                {t("driver.detail.packing.util")}
                            </Badge>
                        )}
                    </div>

                    {/* Stop filter pills — controls the item list below the viewer */}
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => setSelectedStop(null)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                selectedStop === null
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                            }`}
                        >
                            {t("driver.detail.packing.all_stops")}
                        </button>
                        {stops.map((_: StopEntry, i: number) => (
                            <button
                                key={i}
                                onClick={() =>
                                    setSelectedStop(
                                        selectedStop === i ? null : i,
                                    )
                                }
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                    selectedStop === i
                                        ? "bg-primary/10 text-primary border-primary/30"
                                        : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                                }`}
                            >
                                {t("driver.detail.packing.stop_pill", {
                                    number: i + 1,
                                })}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── PackingViewer ── */}
                {packingResult ? (
                    <div className="flex-1 rounded-md overflow-hidden">
                        <PackingViewer
                            truck={truckDimensions}
                            result={packingResult}
                        />
                    </div>
                ) : (
                    <div className="rounded-md bg-muted flex-1 min-h-[280px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Package className="w-8 h-8 opacity-30" />
                        <p className="text-sm">
                            {t("driver.detail.packing.no_plan")}
                        </p>
                    </div>
                )}

                {/* ── Item list for selected stop ── */}
                {selectedStop !== null && currentStopShipment && (
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-48 shrink-0">
                        <p className="text-xs text-muted-foreground">
                            {t("driver.detail.packing.stop_label", {
                                number: selectedStop + 1,
                                address: currentStopShipment.drop_point,
                            })}{" "}
                            ·{" "}
                            <span className="text-foreground font-medium">
                                {t("driver.detail.packing.load_last")}
                            </span>
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {currentStopShipment.shipment_items.map(
                                (item: ShipmentItems) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2 border border-border"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2.5 h-2.5 rounded-sm shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        item.color_hex,
                                                }}
                                            />
                                            <span className="text-sm text-foreground">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {item.length_cm}×{item.width_cm}×
                                            {item.height_cm} cm ·{" "}
                                            {item.weight_kg} kg
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ─── AssignmentDetailPage ─────────────────────────────────────────────────────

function AssignmentDetailPage() {
    const { id } = Route.useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: assignment, isLoading } = useQuery<
        { statusCode: number; data: DriverAssignmentDetail },
        Error,
        DriverAssignmentDetail
    >({
        queryKey: ["driver-assignment", id],
        queryFn: async () => {
            const res = await apiFetch(`/drivers/${id}`);
            if (!res.ok) throw new Error("Failed to fetch assignment");
            return res.json();
        },
        select: (r) => r.data,
    });

    const { mutate: updateStatus, isPending } = useMutation<
        unknown,
        Error,
        AssignmentStatus
    >({
        mutationFn: async (status: AssignmentStatus) => {
            const res = await apiFetch(`/drivers/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["driver-assignment", id],
            });
            queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
        },
    });

    if (isLoading || !assignment)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );

    const layout = getPanelLayout(assignment.status);
    const actionLabelKey = ACTION_LABELS[assignment.status];
    const actionClass = ACTION_CLASSES[assignment.status];
    const nextStatus = NEXT_STATUS[assignment.status];
    const stopCount = buildStops(assignment).length;

    const isTerminal =
        assignment.status === AssignmentStatus.DELIVERED ||
        assignment.status === AssignmentStatus.CANCELLED;

    return (
        <DashboardLayout>
            <button
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
                onClick={() => navigate({ to: "/driver/active-assignments" })}
            >
                <ChevronLeft className="w-4 h-4" />
                {t("active_assignments")}
            </button>

            <Card className="mb-4">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-foreground font-semibold">
                                    {assignment.deliveryJob.id
                                        .slice(0, 8)
                                        .toUpperCase()}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-medium ${STATUS_BADGE[assignment.status]}`}
                                >
                                    {t(STATUS_LABEL[assignment.status])}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {assignment.deliveryJob.truck.model} ·{" "}
                                        {
                                            assignment.deliveryJob.truck
                                                .license_plate
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {t("driver.active_assignments.stop", {
                                            count: stopCount,
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isTerminal && actionLabelKey && nextStatus && (
                            <Button
                                className={`font-medium shrink-0 ${actionClass}`}
                                onClick={() => updateStatus(nextStatus)}
                                disabled={isPending}
                            >
                                {isPending
                                    ? t("driver.detail.action.updating")
                                    : t(actionLabelKey)}
                            </Button>
                        )}

                        {assignment.status === AssignmentStatus.DELIVERED && (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-sm px-3 py-1">
                                {t("driver.detail.delivered_badge")}
                            </Badge>
                        )}
                    </div>

                    <Separator className="mb-4" />
                    <StatusProgressBar status={assignment.status} />
                </CardContent>
            </Card>

            <div className="flex flex-col lg:flex-row gap-4 items-stretch h-[700px]">
                {layout === "packingFirst" ? (
                    <>
                        <PackingPanel
                            assignment={assignment}
                            isPrimary={true}
                        />
                        <RoutePanel assignment={assignment} isPrimary={false} />
                    </>
                ) : layout === "routeFirst" ? (
                    <>
                        <RoutePanel assignment={assignment} isPrimary={true} />
                        <PackingPanel
                            assignment={assignment}
                            isPrimary={false}
                        />
                    </>
                ) : (
                    <>
                        <RoutePanel assignment={assignment} isPrimary={false} />
                        <PackingPanel
                            assignment={assignment}
                            isPrimary={false}
                        />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
