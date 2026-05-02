import type { DeliveryJob } from "./deliveryJob";
import type { Truck } from "./trucks";

export interface ShipmentItems {
    id: string;
    name: string;
    length_cm: number;
    height_cm: number;
    width_cm: number;
    weight_kg: number;
    quantity: number;
    color_hex: string;
    allow_rotation: boolean;
}

export enum ShipmentStatus {
    DRAFT = "draft",
    PENDING = "pending",
    OPTIMIZING = "optimizing",
    READY = "ready",
    ASSIGNED = "assigned",
    IN_PROGRESS = "in_progress",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}

export interface Shipment {
    id: string;
    name: string;
    status: ShipmentStatus;
    notes: string;
    scheduled_at: Date;
    shipment_items: ShipmentItems[];
    drop_point: string;
    createdAt: Date;
    deliveryJob: DeliveryJob;
    lat: string;
    lng: string;
}

export interface PackingInput {
    truck: Truck;
    shipment_items: ShipmentItems[];
}
