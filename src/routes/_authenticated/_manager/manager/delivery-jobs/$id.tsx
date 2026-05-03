import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { Box, Check, Dot, Download, Pin, Truck, User, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeliveryJob } from "@/interfaces/deliveryJob";
import apiFetch from "@/utils/apiFetch";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { DeliveryJobStatusBadge } from "@/components/DeliveryJobStatusBadge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Stat,
    StatDescription,
    StatIndicator,
    StatLabel,
    StatValue,
} from "@/components/ui/stat";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PackingViewer } from "@/components/3DPackingViewer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAlgorithmResult } from "@/hooks/useAlgorithmResult";
import type { Driver } from "@/components/tables/drivers/columns";
import { toast } from "sonner";
import type { RoutingJob } from "@/interfaces/routingJob";
import { RouteMap } from "@/components/RouteMap";
import { AlgorithmResultsDataTable } from "@/components/tables/algorithm_results/data-table";
import { algorithmResultsColumns } from "@/components/tables/algorithm_results/columns";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/delivery-jobs/$id",
)({
    component: DeliveryJobsDetailPage,
    staticData: {
        breadcrumb: "Delivery Job Detail",
    },
});

const ALGO_LABELS = {
    greedy_search: "Greedy Search",
    h1: "H1",
    bottom_left_fill: "Bottom Left Fill",
    extreme_point: "Extreme Point",
    grasp_vnd: "GRASP/VND",
};

function DeliveryJobsDetailPage() {
    console.count("DeliveryJobsDetailPage render");
    const { id } = Route.useParams();
    const [selectedAlgo, setSelectedAlgo] = useState("");
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: deliveryJob, isLoading } = useQuery<any, Error, DeliveryJob>({
        queryKey: [`delivery-job-${id}`],
        queryFn: async () => {
            const res = await apiFetch(`/delivery-jobs/${id}`);
            if (!res.ok) throw new Error("Error fetching delivery job");
            return res.json();
        },
        select: (response) => response.data,
    });

    useEffect(() => {
        if (deliveryJob?.selectedResult?.algorithm && !selectedAlgo) {
            setSelectedAlgo(deliveryJob.selectedResult.algorithm);
        }
    }, [deliveryJob]);

    const shipmentItems = useMemo(
        () => deliveryJob?.shipments.flatMap((s) => s.shipment_items) ?? [],
        [deliveryJob],
    );

    // Then use it here instead of inline flatMap
    const { data: rawPackingResult } = useAlgorithmResult(
        deliveryJob?.packingJob?.id,
        selectedAlgo,
    );

    // Build a lookup map ONCE — O(n) instead of O(n*m) later
    const shipmentItemsById = useMemo(() => {
        const map = new Map<string, any>();
        shipmentItems.forEach((si) => map.set(si.id, si));
        return map;
    }, [shipmentItems]);

    const packingResult = useMemo(() => {
        if (!rawPackingResult) return undefined;

        const placedItems = rawPackingResult.placedItems.map((p: any) => ({
            item: {
                id: p.shipment_item.id,
                name: p.shipment_item.name,
                length_cm: p.shipment_item.length_cm,
                width_cm: p.shipment_item.width_cm,
                height_cm: p.shipment_item.height_cm,
                weight_kg: p.shipment_item.weight_kg,
                color_hex: p.shipment_item.color_hex,
                shipmentId: p.shipment_item.shipment.id,
                shipmentName: p.shipment_item.shipment.name,
                stopIndex: p.stop_index ?? 0,
            },
            x_coordinate: Number(p.x),
            y_coordinate: Number(p.y),
            z_coordinate: Number(p.z),
            width_cm: Number(p.width_cm),
            height_cm: Number(p.height_cm),
            length_cm: Number(p.length_cm),
        }));

        const unplacedItems = (rawPackingResult.unpacked_item_ids ?? [])
            .map((uid: string) => shipmentItemsById.get(uid))
            .filter(Boolean);

        return {
            placedItems,
            unplacedItems,
            usedVolumePercent: Number(rawPackingResult.volume_utilization),
            wastedVolumePercent:
                100 - Number(rawPackingResult.volume_utilization),
        };
    }, [rawPackingResult, shipmentItemsById]);

    const { data: drivers = [] } = useQuery<any, Error, Driver[]>({
        queryKey: ["available-drivers"],
        queryFn: async () => {
            const res = await apiFetch("/drivers/available");
            if (!res.ok) throw new Error("Error fetching drivers");
            return res.json();
        },
        select: (response) => response.data,
    });

    const { data: routingJob } = useQuery<any, Error, RoutingJob>({
        queryKey: [`routing-job-${id}`],
        queryFn: async () => {
            const res = await apiFetch(`/routing/delivery-job/${id}`);
            if (!res.ok) return { data: null };
            return res.json();
        },
        select: (response) => response.data,
        refetchInterval: (query) =>
            query.state.data?.status === "pending" ||
            query.state.data?.status === "running"
                ? 3000
                : false,
    });

    const { data: company } = useQuery({
        queryKey: ["company-me"],
        queryFn: async () => {
            const res = await apiFetch("/companies/me");
            if (!res.ok) throw new Error("Failed to fetch company");
            const json = await res.json();
            return json.data;
        },
    });

    const { mutate: retriggerRouting, isPending: isRetriggering } = useMutation(
        {
            mutationFn: async () => {
                const res = await apiFetch(
                    `/routing/delivery-job/${id}/retrigger`,
                    {
                        method: "POST",
                    },
                );
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message);
                }
                return res.json();
            },
            onSuccess: () => {
                toast.success("Routing job retriggered");
                queryClient.invalidateQueries({
                    queryKey: [`routing-job-${id}`],
                });
            },
            onError: (error) => {
                toast.error(error.message);
            },
        },
    );

    const { mutate: assignDriver, isPending } = useMutation({
        mutationFn: async () => {
            const res = await apiFetch("/drivers/assign", {
                method: "POST",
                body: JSON.stringify({
                    delivery_job_id: id,
                    driver_id: selectedDriverId,
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Driver assigned successfully");
            queryClient.invalidateQueries({ queryKey: [`delivery-job-${id}`] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { mutate: selectAlgorithm, isPending: isSelecting } = useMutation({
        mutationFn: async (algorithmResultId: string) => {
            const res = await apiFetch(`/delivery-jobs/${id}/select-result`, {
                method: "PATCH",
                body: JSON.stringify({
                    algorithm_result_id: algorithmResultId,
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success("Algorithm result selected");
            queryClient.invalidateQueries({ queryKey: [`delivery-job-${id}`] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const totalShipmentItems = deliveryJob?.shipments.reduce(
        (total, shipment) => {
            return (
                total +
                shipment.shipment_items.reduce((sum, item) => {
                    return sum + item.quantity;
                }, 0)
            );
        },
        0,
    );

    const totalShipmentWeight = (deliveryJob?.shipments ?? []).reduce(
        (total, shipment) => {
            return (
                total +
                (shipment.shipment_items ?? []).reduce((sum, item) => {
                    return sum + item.weight_kg * item.quantity;
                }, 0)
            );
        },
        0,
    );

    const totalShipmentVolume = (deliveryJob?.shipments ?? []).reduce(
        (total, shipment) => {
            return (
                total +
                (shipment.shipment_items ?? []).reduce((sum, item) => {
                    return (
                        sum +
                        (item.length_cm *
                            item.width_cm *
                            item.height_cm *
                            item.quantity) /
                            1000000
                    );
                }, 0)
            );
        },
        0,
    );

    const optimizationTimeTaken = deliveryJob?.packingJob.algorithmResults
        .filter((item) => item.execution_time_ms != null)
        .reduce((sum, item) => {
            const v = parseFloat(item.execution_time_ms);
            return isNaN(v) ? sum : sum + v;
        }, 0);

    const handleSelectAlgo = useCallback(
        (algo: string) => {
            setSelectedAlgo(algo);
            const result = deliveryJob?.packingJob.algorithmResults.find(
                (r) => r.algorithm === algo,
            );
            if (
                result &&
                result.algorithm !== deliveryJob?.selectedResult?.algorithm
            ) {
                selectAlgorithm(result.id);
            }
        },
        [deliveryJob, selectAlgorithm],
    );

    if (isLoading) return <Spinner />;

    if (!deliveryJob) return null;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <div className="flex flex-wrap items-center gap-1">
                        <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                            Delivery Job · DJ-
                            {deliveryJob &&
                                format(deliveryJob.createdAt, "yyyy")}
                            -{id.substring(0, 6).toUpperCase()}
                        </h1>
                        <DeliveryJobStatusBadge status={deliveryJob.status} />
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-x-1 gap-y-1 mt-1">
                        <span>
                            Created{" "}
                            {format(deliveryJob.createdAt, "dd MMMM yyyy")}
                        </span>
                        <Dot className="shrink-0" />
                        <span className="flex items-center gap-1">
                            <Truck fill="white" className="shrink-0" />
                            {deliveryJob.truck.model} (
                            {deliveryJob.truck.license_plate})
                        </span>
                        <Dot className="shrink-0" />
                        <span>{deliveryJob.shipments.length} Shipment</span>
                    </CardDescription>
                </div>
                <Button
                    onClick={() =>
                        navigate({
                            to: "/manager/delivery-jobs-result/$id",
                            params: { id: deliveryJob.id },
                        })
                    }
                    variant="outline"
                >
                    <Download /> Export Report
                </Button>
            </div>

            {/* Stats — 2 cols mobile, 3 sm, 5 xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                <Stat>
                    <StatLabel>Total Items</StatLabel>
                    <StatValue>{totalShipmentItems}</StatValue>
                    <StatIndicator />
                    <StatDescription>
                        across {deliveryJob.shipments.length} shipment
                    </StatDescription>
                </Stat>
                <Stat>
                    <StatLabel>Total Item Weight</StatLabel>
                    <StatValue>{totalShipmentWeight.toFixed(2)} kg</StatValue>
                    <StatIndicator />
                    <StatDescription>
                        max {deliveryJob.truck.max_weight_kg} kg
                    </StatDescription>
                </Stat>
                <Stat>
                    <StatLabel>Total Item Volume</StatLabel>
                    <StatValue>
                        {totalShipmentVolume.toFixed(2)} m<sup>3</sup>
                    </StatValue>
                    <StatIndicator />
                    <StatDescription>{deliveryJob.truck.model}</StatDescription>
                </Stat>
                <Stat>
                    <StatLabel>Total Execution Time</StatLabel>
                    <StatIndicator />
                    <StatValue>
                        {optimizationTimeTaken && optimizationTimeTaken >= 1000
                            ? (optimizationTimeTaken / 1000).toFixed(2) + " s"
                            : optimizationTimeTaken?.toFixed(2) + " ms"}
                    </StatValue>
                    <StatDescription>
                        Time taken to run packing & routing optimization
                    </StatDescription>
                </Stat>
                <Stat>
                    <StatLabel>Selected Packing Algorithm</StatLabel>
                    <StatIndicator />
                    <StatValue>
                        {deliveryJob.selectedResult
                            ? ALGO_LABELS[
                                  deliveryJob.selectedResult
                                      .algorithm as keyof typeof ALGO_LABELS
                              ]
                            : "—"}
                    </StatValue>
                    <StatDescription>
                        {deliveryJob.selectedResult
                            ? `${parseFloat(deliveryJob.selectedResult.volume_utilization).toFixed(1)}% volume utilization`
                            : "Select an algorithm result below"}
                    </StatDescription>
                </Stat>
            </div>

            {/* Main two-column layout */}
            <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Left column */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    {/* Shipments */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardDescription className="text-xs uppercase tracking-widest">
                                Shipments ({deliveryJob.shipments.length})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {deliveryJob.shipments.map((shipment, index) => (
                                <Card key={index}>
                                    <CardContent className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Badge className="px-3.5 py-2 shrink-0">
                                                {index + 1}
                                            </Badge>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <CardTitle className="truncate">
                                                    {shipment.name}
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <Pin
                                                        size={16}
                                                        fill="white"
                                                        className="shrink-0"
                                                    />
                                                    <CardDescription className="truncate">
                                                        {shipment.drop_point}
                                                    </CardDescription>
                                                    <Dot className="shrink-0" />
                                                    <CardDescription>
                                                        {format(
                                                            shipment.scheduled_at,
                                                            "dd MMMM yyyy",
                                                        )}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <CardDescription>
                                                {shipment.shipment_items.reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0,
                                                )}{" "}
                                                items
                                            </CardDescription>
                                            <CardDescription>
                                                {shipment.shipment_items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.weight_kg *
                                                            item.quantity,
                                                    0,
                                                )}{" "}
                                                kg
                                            </CardDescription>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    {/* 3D Packing View */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardDescription className="text-xs uppercase tracking-widest">
                                    3D Packing View
                                </CardDescription>
                                <div className="flex flex-wrap items-center gap-2">
                                    <CardDescription>
                                        Showing:{" "}
                                        {ALGO_LABELS[
                                            selectedAlgo as keyof typeof ALGO_LABELS
                                        ] ?? "None selected"}
                                    </CardDescription>
                                    {selectedAlgo &&
                                        selectedAlgo !==
                                            deliveryJob.selectedResult
                                                ?.algorithm && (
                                            <Button
                                                onClick={() => {
                                                    const result =
                                                        deliveryJob.packingJob.algorithmResults.find(
                                                            (r) =>
                                                                r.algorithm ===
                                                                selectedAlgo,
                                                        );
                                                    if (result)
                                                        selectAlgorithm(
                                                            result.id,
                                                        );
                                                }}
                                                disabled={isSelecting}
                                                size="sm"
                                            >
                                                {isSelecting
                                                    ? "Saving..."
                                                    : "Confirm Selection"}
                                            </Button>
                                        )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[500px]">
                            {packingResult ? (
                                <PackingViewer
                                    truck={deliveryJob.truck}
                                    result={packingResult}
                                />
                            ) : (
                                <div className="flex flex-col border border-dotted border-primary/60 items-center justify-center h-full gap-3">
                                    <div className="bg-muted p-4 rounded-full">
                                        <Box className="text-muted-foreground w-8 h-8" />
                                    </div>
                                    <CardDescription>
                                        Select an algorithm result above
                                    </CardDescription>
                                    <CardDescription className="text-xs">
                                        to preview the 3D packing arrangement
                                    </CardDescription>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Routing */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardDescription className="text-xs uppercase tracking-widest">
                                    Routing Optimization
                                </CardDescription>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        isRetriggering ||
                                        routingJob?.status === "running" ||
                                        routingJob?.status === "pending"
                                    }
                                    onClick={() => retriggerRouting()}
                                >
                                    {isRetriggering
                                        ? "Retriggering..."
                                        : "Re-run Routing"}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!routingJob && (
                                <CardDescription className="text-xs">
                                    No routing job found for this delivery job.
                                </CardDescription>
                            )}
                            {(routingJob?.status === "pending" ||
                                routingJob?.status === "running") && (
                                <div className="flex items-center gap-2 text-yellow-500">
                                    <Spinner className="h-4 w-4" />
                                    <CardDescription className="text-xs text-yellow-500">
                                        Routing in progress...
                                    </CardDescription>
                                </div>
                            )}
                            {routingJob?.status === "failed" && (
                                <CardDescription className="text-xs text-red-500">
                                    Routing failed. Make sure all shipments have
                                    coordinates set, then re-run.
                                </CardDescription>
                            )}
                            {routingJob?.status === "completed" &&
                                routingJob?.routingResult && (
                                    <div className="flex flex-col gap-4">
                                        <RouteMap
                                            stops={
                                                routingJob.routingResult
                                                    .stopSequence
                                            }
                                            warehouseLat={Number(
                                                company?.warehouseLat,
                                            )}
                                            warehouseLng={Number(
                                                company?.warehouseLng,
                                            )}
                                        />
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right column */}
                <div className="w-full lg:w-1/2 lg:sticky lg:top-10 flex flex-col gap-4">
                    {/* Driver Assignment */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardDescription className="text-xs uppercase tracking-widest">
                                Driver Assignment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {deliveryJob.driverAssignments.length > 0 ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <User
                                            size={16}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {
                                                deliveryJob.driverAssignments[0]
                                                    .driver.first_name
                                            }{" "}
                                            {
                                                deliveryJob.driverAssignments[0]
                                                    .driver.last_name
                                            }
                                        </p>
                                        <CardDescription className="text-xs">
                                            {
                                                deliveryJob.driverAssignments[0]
                                                    .status
                                            }
                                        </CardDescription>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Select
                                            onValueChange={setSelectedDriverId}
                                            value={selectedDriverId}
                                        >
                                            <SelectTrigger className="flex-1 min-w-40">
                                                <SelectValue placeholder="Select a driver" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {drivers.map((driver) => (
                                                        <SelectItem
                                                            key={driver.id}
                                                            value={driver.id}
                                                        >
                                                            {driver.first_name +
                                                                " " +
                                                                driver.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            disabled={
                                                !selectedDriverId ||
                                                !selectedAlgo ||
                                                isPending
                                            }
                                            onClick={() => assignDriver()}
                                        >
                                            {isPending
                                                ? "Assigning..."
                                                : "Confirm Assignment"}
                                        </Button>
                                    </div>
                                    {!selectedAlgo && (
                                        <p className="text-xs text-yellow-500">
                                            ⚠ Select an algorithm result before
                                            assigning a driver
                                        </p>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Truck Info */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardDescription className="text-xs uppercase tracking-widest">
                                Truck Info
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Truck fill="white" className="shrink-0" />
                                <div>
                                    <CardTitle>
                                        {deliveryJob.truck.model}
                                    </CardTitle>
                                    <CardDescription>
                                        {deliveryJob.truck.license_plate}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <Stat>
                                    <StatDescription>
                                        Max Weight
                                    </StatDescription>
                                    <StatLabel>
                                        {deliveryJob.truck.max_weight_kg} kg
                                    </StatLabel>
                                </Stat>
                                <Stat>
                                    <StatDescription>Volume</StatDescription>
                                    <StatLabel>
                                        {(
                                            (deliveryJob.truck.length_cm *
                                                deliveryJob.truck.width_cm *
                                                deliveryJob.truck.height_cm) /
                                            1000000
                                        ).toFixed(2)}{" "}
                                        m<sup>3</sup>
                                    </StatLabel>
                                </Stat>
                                <Stat>
                                    <StatDescription>
                                        L x W x H (cm)
                                    </StatDescription>
                                    <StatLabel>
                                        {deliveryJob.truck.length_cm} x{" "}
                                        {deliveryJob.truck.width_cm} x{" "}
                                        {deliveryJob.truck.height_cm}
                                    </StatLabel>
                                </Stat>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Algorithm Results */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardDescription className="text-xs uppercase tracking-widest">
                                    Algorithm Results
                                </CardDescription>
                                {selectedAlgo ? (
                                    <Badge>
                                        <Check />
                                        {ALGO_LABELS[
                                            selectedAlgo as keyof typeof ALGO_LABELS
                                        ] ?? "None selected"}{" "}
                                        selected
                                    </Badge>
                                ) : (
                                    <Badge>
                                        <X /> None selected
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AlgorithmResultsDataTable
                                columns={algorithmResultsColumns}
                                data={deliveryJob.packingJob.algorithmResults}
                                selectedAlgo={selectedAlgo}
                                onSelectAlgo={handleSelectAlgo}
                            />
                        </CardContent>
                    </Card>

                    {/* Stop order */}
                    <Card className="bg-transparent">
                        <CardHeader>
                            <CardDescription className="text-xs uppercase tracking-widest">
                                Optimized stop order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {routingJob?.routingResult &&
                                routingJob.routingResult.stopSequence.map(
                                    (stop, index) => {
                                        const shipment =
                                            deliveryJob.shipments.find(
                                                (s) => s.id === stop.shipmentId,
                                            );
                                        return (
                                            <div
                                                key={stop.shipmentId}
                                                className="flex gap-4"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <Badge>{index + 1}</Badge>
                                                    {index <
                                                        (routingJob
                                                            ?.routingResult
                                                            ?.stopSequence
                                                            ?.length ?? 0) -
                                                            1 && (
                                                        <div className="w-0.5 flex-1 bg-border my-1 min-h-6" />
                                                    )}
                                                </div>
                                                <div className="pb-4 min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <Pin
                                                            size={12}
                                                            fill="white"
                                                            className="text-muted-foreground shrink-0"
                                                        />
                                                        <p className="text-sm font-medium truncate">
                                                            {shipment?.name ||
                                                                "Unknown Shipment"}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Pin
                                                            size={10}
                                                            fill="white"
                                                            className="text-muted-foreground opacity-70 shrink-0"
                                                        />
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {stop.dropPoint}
                                                        </p>
                                                    </div>
                                                    <CardDescription className="text-xs font-mono mt-0.5">
                                                        {stop.lat.toFixed(5)},{" "}
                                                        {stop.lng.toFixed(5)}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        );
                                    },
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
