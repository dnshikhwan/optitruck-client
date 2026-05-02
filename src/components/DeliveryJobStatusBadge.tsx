import { Badge } from "@/components/ui/badge";
import { DeliveryJobStatus } from "@/interfaces/deliveryJob";
import { Loader2 } from "lucide-react";

type BadgeConfig = {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
};

export const deliveryJobStatusConfig: Record<DeliveryJobStatus, BadgeConfig> = {
    [DeliveryJobStatus.DRAFT]: {
        label: "Draft",
        variant: "outline",
    },
    [DeliveryJobStatus.PENDING]: {
        label: "Pending",
        variant: "secondary",
    },
    [DeliveryJobStatus.OPTIMIZING]: {
        label: "Optimizing",
        variant: "default",
        className: "bg-blue-500 hover:bg-blue-600",
    },
    [DeliveryJobStatus.READY]: {
        label: "Ready",
        variant: "default",
        className: "bg-green-500/40 text-green-300 hover:bg-emerald-600",
    },
    [DeliveryJobStatus.ASSIGNED]: {
        label: "Assigned",
        variant: "default",
        className: "bg-violet-500 hover:bg-violet-600",
    },
    [DeliveryJobStatus.IN_TRANSIT]: {
        label: "In Transit",
        variant: "default",
        className: "bg-amber-500 hover:bg-amber-600",
    },
    [DeliveryJobStatus.DELIVERED]: {
        label: "Delivered",
        variant: "default",
        className: "bg-green-600 hover:bg-green-700",
    },
    [DeliveryJobStatus.CANCELLED]: {
        label: "Cancelled",
        variant: "destructive",
    },
};

type Props = {
    status: DeliveryJobStatus;
};

export function DeliveryJobStatusBadge({ status }: Props) {
    const { label, variant, className } = deliveryJobStatusConfig[status];
    const isOptimizing = status === DeliveryJobStatus.OPTIMIZING;

    return (
        <Badge variant={variant} className={className}>
            {isOptimizing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            {label}
        </Badge>
    );
}
