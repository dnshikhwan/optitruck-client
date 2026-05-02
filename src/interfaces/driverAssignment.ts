import type { User } from "@/auth";
import type { DeliveryJob } from "./deliveryJob";

export enum AssignmentStatus {
    ASSIGNED = "ASSIGNED",
    ACKNOWLEDGED = "ACKNOWLEDGED",
    LOADING = "LOADING",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
}

export interface DriverAssignment {
    id: string;
    status: AssignmentStatus;
    updatedAt: string;
    deliveryJob: DeliveryJob;
    assignedBy: User;
}

export interface DriverAssignmentDetail {
    id: string;
    status: AssignmentStatus;
    acknowledged_at: string | null;
    updatedAt: string;
    deliveryJob: DeliveryJob;
    assignedBy: {
        id: string;
        first_name: string;
        last_name: string;
    };
    company: {
        warehouseLat: string | null;
        warehouseLng: string | null;
    };
}
