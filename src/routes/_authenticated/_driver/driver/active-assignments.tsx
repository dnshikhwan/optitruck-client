import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { DashboardLayout } from "../../../../../layouts";
import {
    AssignmentStatus,
    type DriverAssignment,
} from "@/interfaces/driverAssignment";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Truck,
    MapPin,
    ArrowLeftRight,
    User,
    AlertCircle,
    Package,
} from "lucide-react";
import { CustomSpinner } from "@/components/custom-spinner";

export const Route = createFileRoute(
    "/_authenticated/_driver/driver/active-assignments",
)({
    component: DriverDashboard,
});

// ─── Status config ─────────────────────────────────────────────────────────────
// labelKey and actionKey are i18n keys — passed to t() at render time.
// This keeps STATUS_CONFIG static and language-agnostic.

const STATUS_CONFIG: Record<
    AssignmentStatus,
    {
        labelKey: string;
        badgeClass: string;
        accentClass: string;
        actionKey: string | null;
        actionClass: string | null;
    }
> = {
    [AssignmentStatus.ASSIGNED]: {
        labelKey: "driver.active_assignments.status.ASSIGNED",
        badgeClass:
            "bg-orange-500/10 text-orange-500 border-orange-500/25 hover:bg-orange-500/10",
        accentClass: "bg-orange-500",
        actionKey: "driver.active_assignments.action.acknowledge",
        actionClass: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    [AssignmentStatus.ACKNOWLEDGED]: {
        labelKey: "driver.active_assignments.status.ACKNOWLEDGED",
        badgeClass:
            "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10",
        accentClass: "bg-primary",
        actionKey: null,
        actionClass: null,
    },
    [AssignmentStatus.LOADING]: {
        labelKey: "driver.active_assignments.status.LOADING",
        badgeClass:
            "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/10",
        accentClass: "bg-amber-500",
        actionKey: null,
        actionClass: null,
    },
    [AssignmentStatus.IN_TRANSIT]: {
        labelKey: "driver.active_assignments.status.IN_TRANSIT",
        badgeClass:
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10",
        accentClass: "bg-emerald-500",
        actionKey: null,
        actionClass: null,
    },
    [AssignmentStatus.DELIVERED]: {
        labelKey: "driver.active_assignments.status.DELIVERED",
        badgeClass:
            "bg-muted text-muted-foreground border-border hover:bg-muted",
        accentClass: "bg-muted-foreground",
        actionKey: null,
        actionClass: null,
    },
    [AssignmentStatus.CANCELLED]: {
        labelKey: "driver.active_assignments.status.CANCELLED",
        badgeClass:
            "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10",
        accentClass: "bg-destructive",
        actionKey: null,
        actionClass: null,
    },
};

const STATUS_SORT_ORDER: Record<AssignmentStatus, number> = {
    [AssignmentStatus.ASSIGNED]: 0,
    [AssignmentStatus.LOADING]: 1,
    [AssignmentStatus.IN_TRANSIT]: 2,
    [AssignmentStatus.ACKNOWLEDGED]: 3,
    [AssignmentStatus.DELIVERED]: 4,
    [AssignmentStatus.CANCELLED]: 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countUnacknowledged(assignments: DriverAssignment[]): number {
    return assignments.filter((a) => a.status === AssignmentStatus.ASSIGNED)
        .length;
}

function getDistance(assignment: DriverAssignment): number | null {
    const raw =
        assignment.deliveryJob.routingJob?.routingResult?.totalDistanceKm;
    if (raw == null) return null;
    return parseFloat(raw);
}

function getStopCount(assignment: DriverAssignment): number | null {
    const seq = assignment.deliveryJob.routingJob?.routingResult?.stopSequence;
    if (!seq) return null;
    return seq.length;
}

function getAssignerName(assignment: DriverAssignment): string {
    return `${assignment.assignedBy.first_name} ${assignment.assignedBy.last_name}`.trim();
}

// ─── AssignmentCard ───────────────────────────────────────────────────────────

interface AssignmentCardProps {
    assignment: DriverAssignment;
    onAcknowledge: (id: string) => void;
    onViewDetails: (id: string) => void;
    isAcknowledging: boolean;
}

function AssignmentCard({
    assignment,
    onAcknowledge,
    onViewDetails,
    isAcknowledging,
}: AssignmentCardProps) {
    const { t } = useTranslation();
    const config = STATUS_CONFIG[assignment.status];
    const isAssigned = assignment.status === AssignmentStatus.ASSIGNED;
    const isCancelled = assignment.status === AssignmentStatus.CANCELLED;

    const stopCount = getStopCount(assignment);
    const distance = getDistance(assignment);
    const assignerName = getAssignerName(assignment);

    return (
        <div className="relative overflow-hidden rounded-lg">
            <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${config.accentClass}`}
            />
            <Card
                className={`pl-3 transition-colors duration-150 ${
                    isAssigned ? "border-orange-500/30" : "border-border"
                } ${isCancelled ? "opacity-50" : ""}`}
            >
                <CardContent>
                    {/* ── Top row ── */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-foreground font-semibold">
                                    {assignment.deliveryJob.id
                                        .slice(0, 8)
                                        .toUpperCase()}
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs font-medium ${config.badgeClass}`}
                                >
                                    {t(config.labelKey)}
                                </Badge>
                                {isAssigned && (
                                    <span className="flex items-center gap-1 text-orange-500/70 text-xs">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {t(
                                            "driver.active_assignments.needs_acknowledgment",
                                        )}
                                    </span>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm">
                                {t("driver.active_assignments.assigned_by", {
                                    name: assignerName,
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {isAssigned && config.actionKey && (
                                <Button
                                    size="sm"
                                    className={`font-medium ${config.actionClass}`}
                                    onClick={() => onAcknowledge(assignment.id)}
                                    disabled={isAcknowledging}
                                >
                                    {isAcknowledging
                                        ? t(
                                              "driver.active_assignments.action.confirming",
                                          )
                                        : t(config.actionKey)}
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewDetails(assignment.id)}
                            >
                                {t(
                                    "driver.active_assignments.action.view_details",
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator className="mb-4" />

                    {/* ── Detail chips ── */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-sm">
                                {assignment.deliveryJob.truck.model} ·{" "}
                                {assignment.deliveryJob.truck.license_plate}
                            </span>
                        </div>

                        {stopCount !== null && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground text-sm">
                                    {t("driver.active_assignments.stop", {
                                        count: stopCount,
                                    })}
                                </span>
                            </div>
                        )}

                        {distance !== null && (
                            <div className="flex items-center gap-2">
                                <ArrowLeftRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground text-sm">
                                    {distance.toFixed(1)} km
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-sm">
                                {assignerName}
                            </span>
                        </div>

                        {stopCount === null && (
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground text-sm">
                                    {t(
                                        "driver.active_assignments.route_not_calculated",
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCancelled && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <button
                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                                onClick={() => onViewDetails(assignment.id)}
                            >
                                {t(
                                    "driver.active_assignments.view_route_packing",
                                )}
                            </button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DriverDashboard() {
    const { auth } = Route.useRouteContext();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: assignments = [], isLoading } = useQuery<
        { statusCode: number; data: DriverAssignment[] },
        Error,
        DriverAssignment[]
    >({
        queryKey: ["driver-assignments"],
        queryFn: async () => {
            const res = await apiFetch("/drivers/mine");
            if (!res.ok) throw new Error("Error fetching driver assignments");
            return res.json();
        },
        select: (response) => response.data,
    });

    const { mutate: acknowledge, isPending: isAcknowledging } = useMutation<
        unknown,
        Error,
        string
    >({
        mutationFn: async (id) => {
            const res = await apiFetch(`/drivers/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: AssignmentStatus.ACKNOWLEDGED }),
            });
            if (!res.ok) throw new Error("Failed to acknowledge assignment");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
        },
    });

    function handleViewDetails(id: string) {
        navigate({ to: "/driver/assignments/$id", params: { id } });
    }

    const unacknowledgedCount = countUnacknowledged(assignments);

    const sorted = [...assignments].sort((a, b) => {
        const diff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
        if (diff !== 0) return diff;
        return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    });

    if (isLoading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );

    return (
        <DashboardLayout>
            {/* ── Greeting ── */}
            <div>
                <h1 className="scroll-m-20 font-heading font-extrabold text-xl">
                    {t("welcome_back")}, {auth.user?.first_name}{" "}
                    {auth.user?.last_name}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {format(new Date(), "eeee, dd MMMM yyyy")}
                </p>
            </div>

            {/* ── Section header ── */}
            <div>
                <h2 className="text-foreground text-lg font-medium">
                    {t("driver.active_assignments.title")}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                    {t("driver.active_assignments.subtitle", {
                        count: assignments.length,
                    })}
                    {unacknowledgedCount > 0 && (
                        <span className="text-orange-500">
                            {" "}
                            {t("driver.active_assignments.needs_ack", {
                                count: unacknowledgedCount,
                            })}
                        </span>
                    )}
                </p>
            </div>

            {/* ── List or empty state ── */}
            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Truck className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-foreground text-sm font-medium">
                        {t("driver.active_assignments.empty_title")}
                    </p>
                    <p className="text-muted-foreground text-xs max-w-xs">
                        {t("driver.active_assignments.empty_description")}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sorted.map((assignment) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onAcknowledge={(id) => acknowledge(id)}
                            onViewDetails={handleViewDetails}
                            isAcknowledging={isAcknowledging}
                        />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
