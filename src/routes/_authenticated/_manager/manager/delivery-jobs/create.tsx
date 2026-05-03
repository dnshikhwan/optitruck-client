import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Calendar,
    Check,
    MoveLeft,
    MoveRight,
    Pin,
    Star,
    TruckIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import type { Shipment } from "@/interfaces/shipments";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { Truck } from "@/interfaces/trucks";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/delivery-jobs/create",
)({
    component: CreateDeliveryJob,
    staticData: {
        breadcrumb: "Create Delivery Job",
    },
});

function CreateDeliveryJob() {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedShipmentIds, setSelectedShipmentIds] = useState<string[]>(
        [],
    );
    const [selectedTruckId, setSelectedTruckId] = useState<string>("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const steps = useMemo(
        () => [
            { label: t("select_truck") },
            { label: t("select_shipments") },
            { label: t("review_and_confirm") },
        ],
        [t],
    );

    useEffect(() => {
        setSelectedShipmentIds([]);
    }, [selectedTruckId]);

    const { data: shipments = [], isLoading: isLoadingShipments } = useQuery<
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

    const { data: suggestedShipments = [], isLoading: isLoadingSuggestions } =
        useQuery<any, Error, Shipment[]>({
            queryKey: ["shipments-suggestions", selectedTruckId],
            queryFn: async () => {
                const res = await apiFetch(
                    `/shipments/suggestions?truckId=${selectedTruckId}`,
                );
                if (!res.ok) throw new Error("Error fetching trucks");
                return res.json();
            },
            select: (response) => response.data,
            enabled: !!selectedTruckId && currentStep >= 1,
            staleTime: 5 * 60 * 1000,
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

    const { mutate: createJob, isPending } = useMutation({
        mutationFn: async () => {
            const res = await apiFetch("/delivery-jobs", {
                method: "POST",
                body: JSON.stringify({
                    shipment_ids: selectedShipmentIds,
                    truck_id: selectedTruckId,
                }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["delivery-jobs"] });
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            navigate({
                to: "/manager/delivery-jobs/$id",
                params: { id: data.data.deliveryJob.id },
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isLoadingShipments) return <Spinner />;

    const toggleShipment = (id: string) => {
        setSelectedShipmentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const handleNext = () => {
        if (currentStep < steps.length) setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const applySuggestions = () => {
        setSelectedShipmentIds(suggestedShipments.map((s) => s.id));
    };

    const selectedShipments = shipments.filter((s) =>
        selectedShipmentIds.includes(s.id),
    );

    const selectedShipmentsTotalWeight = selectedShipments.reduce(
        (total, shipment) => {
            return (
                total +
                shipment.shipment_items.reduce(
                    (sum, item) => sum + item.weight_kg * item.quantity,
                    0,
                )
            );
        },
        0,
    );

    const selectedShipmentsTotalVolume = selectedShipments.reduce(
        (total, shipment) => {
            return (
                total +
                shipment.shipment_items.reduce((sum, item) => {
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

    const selectedShipmentsTotalItems = selectedShipments.reduce(
        (total, shipment) => {
            return (
                total +
                shipment.shipment_items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                )
            );
        },
        0,
    );

    const selectedTruck = trucks.find((truck) => truck.id === selectedTruckId);
    const suggestedIds = new Set(suggestedShipments.map((s) => s.id));

    const availableShipments = shipments
        .filter((shipment) => shipment.status === "pending")
        .sort((a, b) => {
            const aSuggested = suggestedIds.has(a.id) ? 1 : 0;
            const bSuggested = suggestedIds.has(b.id) ? 1 : 0;
            return bSuggested - aSuggested;
        });

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-extrabold font-heading">
                        {t("create_delivery_job")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("group_shipments_description")}
                    </p>
                </div>
            </div>
            <StepIndicator steps={steps} currentStep={currentStep} />
            <div
                id="create-delivery-job-form"
                className="flex items-start gap-4"
            >
                {/* Step 1 — Select Shipments */}
                {currentStep === 1 && (
                    <Card className="w-full bg-transparent border-none shadow-none">
                        <CardHeader>
                            <CardTitle>{t("select_shipments")}</CardTitle>
                            <CardDescription>
                                {t("select_shipments_description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {selectedTruckId && (
                                <Card className="bg-primary/5 border-primary/30 mb-2">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                {isLoadingSuggestions
                                                    ? t("computing_suggestions")
                                                    : suggestedShipments.length ===
                                                        0
                                                      ? t(
                                                            "no_suggestions_available",
                                                        )
                                                      : t(
                                                            "shipments_suggested",
                                                            {
                                                                count: suggestedShipments.length,
                                                            },
                                                        )}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {suggestedShipments.length ===
                                                    0 && !isLoadingSuggestions
                                                    ? t("truck_too_small")
                                                    : t("based_on_urgency")}
                                            </p>
                                        </div>
                                        {!isLoadingSuggestions &&
                                            suggestedShipments.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={applySuggestions}
                                                >
                                                    {t("apply_suggestions")}
                                                </Button>
                                            )}
                                    </CardContent>
                                </Card>
                            )}

                            {availableShipments.map((shipment) => {
                                const isSuggested = suggestedShipments.some(
                                    (s) => s.id === shipment.id,
                                );
                                return (
                                    <Card
                                        key={shipment.id}
                                        onClick={() =>
                                            toggleShipment(shipment.id)
                                        }
                                        className={`cursor-pointer transition-all ${
                                            selectedShipmentIds.includes(
                                                shipment.id,
                                            )
                                                ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                                                : "bg-transparent hover:border-muted-foreground/50"
                                        }`}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={selectedShipmentIds.includes(
                                                            shipment.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleShipment(
                                                                shipment.id,
                                                            )
                                                        }
                                                    />
                                                    {shipment.name}
                                                    <span className="text-muted-foreground text-xs">
                                                        SHP-
                                                        {format(
                                                            new Date(),
                                                            "yyyy",
                                                        )}
                                                        -
                                                        {shipment.id
                                                            .substring(0, 6)
                                                            .toUpperCase()}
                                                    </span>
                                                    {isSuggested && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="gap-1"
                                                        >
                                                            <Star
                                                                size={12}
                                                                className="fill-current"
                                                            />
                                                            {t("suggested")}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Badge>
                                                    {shipment.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        shipment.status
                                                            .slice(1)
                                                            .toLowerCase()}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-5">
                                                <div className="flex flex-col gap-3">
                                                    <CardDescription className="text-xs uppercase tracking-widest">
                                                        {t("drop_point_label")}
                                                    </CardDescription>
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Pin size={15} />{" "}
                                                        {shipment.drop_point}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <CardDescription className="text-xs uppercase tracking-widest">
                                                        {t(
                                                            "scheduled_at_label",
                                                        )}
                                                    </CardDescription>
                                                    <CardDescription className="flex items-center gap-2">
                                                        <Calendar size={15} />{" "}
                                                        {format(
                                                            shipment.scheduled_at,
                                                            "dd MMMM yyyy",
                                                        )}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap items-center gap-1">
                                            <Badge variant="secondary">
                                                {shipment.shipment_items.reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0,
                                                )}{" "}
                                                {t("items")}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {shipment.shipment_items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.weight_kg *
                                                            item.quantity,
                                                    0,
                                                )}{" "}
                                                kg
                                            </Badge>
                                            {shipment.shipment_items.map(
                                                (item, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                    >
                                                        {item.name} x
                                                        {item.quantity}
                                                    </Badge>
                                                ),
                                            )}
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Step 0 — Select Truck */}
                {currentStep === 0 && (
                    <Card className="w-full bg-transparent border-none shadow-none">
                        <CardHeader>
                            <CardTitle>{t("select_truck")}</CardTitle>
                            <CardDescription>
                                {t("select_truck_description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedTruckId}
                                onValueChange={setSelectedTruckId}
                                className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
                            >
                                {trucks.map((truck) => (
                                    <Label
                                        key={truck.id}
                                        htmlFor={truck.id}
                                        className="cursor-pointer"
                                    >
                                        <Card
                                            className={`transition-all ${
                                                selectedTruckId === truck.id
                                                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                                    : "bg-transparent hover:border-muted-foreground/50"
                                            }`}
                                        >
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <RadioGroupItem
                                                        value={truck.id}
                                                        id={truck.id}
                                                    />
                                                    <div>
                                                        <CardTitle className="text-sm">
                                                            {truck.model}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {
                                                                truck.license_plate
                                                            }
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="px-4 pb-4 flex flex-col gap-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-muted/50 rounded-lg p-2">
                                                        <p className="text-xs text-muted-foreground mb-0.5">
                                                            {t("max_weight")}
                                                        </p>
                                                        <p className="text-xs">
                                                            {truck.max_weight_kg.toLocaleString()}{" "}
                                                            kg
                                                        </p>
                                                    </div>
                                                    <div className="bg-muted/50 rounded-lg p-2">
                                                        <p className="text-xs text-muted-foreground mb-0.5">
                                                            L × W × H (cm)
                                                        </p>
                                                        <p className="text-xs">
                                                            {truck.length_cm} ×{" "}
                                                            {truck.width_cm} ×{" "}
                                                            {truck.height_cm}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2 — Review & Confirm */}
                {currentStep === 2 && (
                    <Card className="w-full bg-transparent border-none shadow-none">
                        <CardHeader>
                            <CardTitle>{t("review_and_confirm")}</CardTitle>
                            <CardDescription>
                                {t("review_description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {selectedTruck && (
                                <Card className="bg-transparent">
                                    <CardHeader>
                                        <CardDescription className="uppercase tracking-widest text-xs">
                                            {t("assigned_truck")}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <TruckIcon />
                                                <div>
                                                    <CardTitle>
                                                        {selectedTruck.model}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {
                                                            selectedTruck.license_plate
                                                        }
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <div>
                                                <CardDescription>
                                                    {t("dimension_lwh")}
                                                </CardDescription>
                                                <CardDescription>
                                                    {selectedTruck.length_cm} x{" "}
                                                    {selectedTruck.width_cm} x{" "}
                                                    {selectedTruck.height_cm}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {selectedTruck && (
                                <Card className="bg-transparent">
                                    <CardHeader>
                                        <CardDescription className="uppercase tracking-widest text-xs">
                                            {t("capacity_check")}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>
                                                    {t("volume_capacity")}
                                                </span>
                                                <span>
                                                    {selectedShipmentsTotalVolume.toFixed(
                                                        2,
                                                    )}{" "}
                                                    /{" "}
                                                    {(
                                                        (selectedTruck.length_cm *
                                                            selectedTruck.height_cm *
                                                            selectedTruck.width_cm) /
                                                        1000000
                                                    ).toFixed(2)}{" "}
                                                    m<sup>3</sup>
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(
                                                    (selectedShipmentsTotalVolume /
                                                        ((selectedTruck.length_cm *
                                                            selectedTruck.width_cm *
                                                            selectedTruck.height_cm) /
                                                            1000000)) *
                                                        100,
                                                    100,
                                                )}
                                                indicatorClassName={
                                                    selectedShipmentsTotalVolume >
                                                    (selectedTruck.length_cm *
                                                        selectedTruck.width_cm *
                                                        selectedTruck.height_cm) /
                                                        1000000
                                                        ? "bg-red-500/70"
                                                        : selectedShipmentsTotalVolume /
                                                                ((selectedTruck.length_cm *
                                                                    selectedTruck.width_cm *
                                                                    selectedTruck.height_cm) /
                                                                    1000000) >
                                                            0.8
                                                          ? "bg-red-500/70"
                                                          : "bg-primary/70"
                                                }
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {Math.min(
                                                    (selectedShipmentsTotalVolume /
                                                        ((selectedTruck.length_cm *
                                                            selectedTruck.width_cm *
                                                            selectedTruck.height_cm) /
                                                            1000000)) *
                                                        100,
                                                    100,
                                                ).toFixed(2)}
                                                {t("utilization")}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>{t("weight_load")}</span>
                                                <span>
                                                    {selectedShipmentsTotalWeight.toLocaleString()}{" "}
                                                    /{" "}
                                                    {Number(
                                                        selectedTruck.max_weight_kg,
                                                    )
                                                        .toFixed(2)
                                                        .toLocaleString()}{" "}
                                                    kg
                                                </span>
                                            </div>
                                            <Progress
                                                value={Math.min(
                                                    (selectedShipmentsTotalWeight /
                                                        selectedTruck.max_weight_kg) *
                                                        100,
                                                    100,
                                                )}
                                                indicatorClassName={
                                                    selectedShipmentsTotalWeight >
                                                    selectedTruck.max_weight_kg
                                                        ? "bg-red-500/70"
                                                        : selectedShipmentsTotalWeight /
                                                                selectedTruck.max_weight_kg >
                                                            0.8
                                                          ? "bg-red-500/70"
                                                          : "bg-primary/70"
                                                }
                                            />
                                            <div className="text-xs text-muted-foreground">
                                                {Math.min(
                                                    (selectedShipmentsTotalWeight /
                                                        selectedTruck.max_weight_kg) *
                                                        100,
                                                    100,
                                                ).toFixed(2)}
                                                {t("utilization")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            <Card className="bg-transparent">
                                <CardHeader>
                                    <CardDescription className="uppercase tracking-widest text-xs">
                                        {t("shipments_count", {
                                            count: selectedShipments.length,
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    {selectedShipments.map(
                                        (shipment, index) => (
                                            <Card key={shipment.id}>
                                                <CardContent className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline">
                                                            {index + 1}
                                                        </Badge>
                                                        <div>
                                                            <CardDescription>
                                                                {shipment.name}
                                                            </CardDescription>
                                                            <CardDescription className="flex items-center gap-1">
                                                                <Pin
                                                                    fill="white"
                                                                    size={15}
                                                                />
                                                                {
                                                                    shipment.drop_point
                                                                }
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <CardDescription>
                                                            {shipment.shipment_items.reduce(
                                                                (total, item) =>
                                                                    total +
                                                                    item.quantity,
                                                                0,
                                                            )}{" "}
                                                            {t("items")}
                                                        </CardDescription>
                                                        <CardDescription>
                                                            {shipment.shipment_items.reduce(
                                                                (total, item) =>
                                                                    total +
                                                                    item.weight_kg *
                                                                        item.quantity,
                                                                0,
                                                            )}{" "}
                                                            kg
                                                        </CardDescription>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ),
                                    )}
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                )}

                {/* Job Summary sidebar */}
                <Card className="w-2/3 sticky top-4">
                    <CardHeader>
                        <CardDescription className="uppercase text-xs tracking-widest">
                            {t("job_summary")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Card className="border-none">
                            <CardContent className="flex items-center justify-between">
                                <CardDescription>
                                    {t("shipments")}
                                </CardDescription>
                                <CardDescription>
                                    {selectedShipmentIds.length === 0
                                        ? t("none_selected")
                                        : t("selected_count", {
                                              count: selectedShipmentIds.length,
                                          })}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Separator />
                        <Card className="border-none">
                            <CardContent className="flex items-center justify-between">
                                <CardDescription>
                                    {t("total_items")}
                                </CardDescription>
                                <CardDescription>
                                    {selectedShipmentIds.length === 0
                                        ? "—"
                                        : selectedShipmentsTotalItems}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Separator />
                        <Card className="border-none">
                            <CardContent className="flex items-center justify-between">
                                <CardDescription>
                                    {t("total_weight")}
                                </CardDescription>
                                <CardDescription>
                                    {selectedShipmentIds.length === 0
                                        ? "—"
                                        : `${selectedShipmentsTotalWeight} kg${selectedTruck ? ` / ${selectedTruck.max_weight_kg} kg` : ""}`}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Separator />
                        <Card className="border-none">
                            <CardContent className="flex items-center justify-between">
                                <CardDescription>{t("trucks")}</CardDescription>
                                <CardDescription>
                                    {selectedTruck
                                        ? selectedTruck.model
                                        : t("not_selected")}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Separator />
                        <Card className="border-none">
                            <CardContent className="flex items-center justify-between">
                                <CardDescription>
                                    {t("max_capacity")}
                                </CardDescription>
                                <CardDescription>
                                    {selectedTruck
                                        ? `${selectedTruck.max_weight_kg} kg`
                                        : "—"}
                                </CardDescription>
                            </CardContent>
                        </Card>
                        <Separator />
                        <Card className="border-none">
                            <CardDescription className="text-xs tracking-widest uppercase">
                                {t("drop_points")}
                            </CardDescription>
                            <CardContent>
                                <CardDescription className="flex flex-col gap-2">
                                    {selectedShipments.map(
                                        (shipment, index) => (
                                            <div
                                                key={shipment.id}
                                                className="flex items-center gap-1"
                                            >
                                                <Badge>{index + 1}</Badge>
                                                <CardDescription>
                                                    {shipment.drop_point}
                                                </CardDescription>
                                            </div>
                                        ),
                                    )}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        {currentStep < steps.length - 1 ? (
                            <Button
                                disabled={
                                    currentStep === 0
                                        ? selectedTruckId === ""
                                        : currentStep === 1
                                          ? selectedShipmentIds.length === 0
                                          : false
                                }
                                onClick={handleNext}
                                className="w-full"
                            >
                                {t("continue")} <MoveRight />
                            </Button>
                        ) : (
                            <Button
                                disabled={isPending}
                                onClick={() => createJob()}
                                className="w-full"
                            >
                                <Check /> {t("create_delivery_job")}
                            </Button>
                        )}
                        <Button
                            disabled={currentStep === 0}
                            onClick={handlePrevious}
                            className="w-full"
                            variant="outline"
                        >
                            <MoveLeft /> {t("back")}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
}
