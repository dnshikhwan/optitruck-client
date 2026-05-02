import type { User } from "@/auth";
import type { Truck } from "./trucks";
import type { Shipment, ShipmentItems } from "./shipments";

export enum DeliveryJobStatus {
    DRAFT = "draft",
    PENDING = "pending",
    OPTIMIZING = "optimizing",
    READY = "ready",
    ASSIGNED = "assigned",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}

export enum AlgorithmName {
    GREEDY_SEARCH = "greedy_search",
    H1 = "h1",
    BOTTOM_LEFT_FILL = "bottom_left_fill",
    EXTREME_POINT = "extreme_point",
    GRASP_VND = "grasp_vnd",
}

export enum AlgorithmStatus {
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
}

export enum PackingJobStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed",
}

export enum FragilityLevel {
    NONE = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export interface PlacedItem {
    id: string;
    chosen_orientation: string;
    x: string;
    y: string;
    z: string;
    width_cm: string;
    height_cm: string;
    length_cm: string;
    stop_index: number;
    sequence: number;
    shipment_item: ShipmentItems;
}

export interface AlgorithmResult {
    id: string;
    algorithm: AlgorithmName;
    status: AlgorithmStatus;
    execution_time_ms: string;
    volume_utilization: string;
    weight_utilization: string | null;
    items_packed: number;
    items_total: number;
    unpacked_item_ids: string[];
    createdAt: string;
    placedItems: PlacedItem[];
    lifo_ok: boolean;
    lifo_violations: number;
    support_ok: boolean;
    avg_support_ratio: string | null;
    fragility_ok: boolean;
    fragility_violations: number;
    cog_ok: boolean;
    cog_ratio: string | null;
}

export interface PackingJob {
    id: string;
    status: PackingJobStatus;
    algorithmResults: AlgorithmResult[];
    createdAt: string;
    completedAt: string | null;
}

export interface DriverAssignment {
    id: string;
    driver: User;
    status: string;
    assigned_at: string;
    acknowledged_at: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoutingResult {
    id: string;
    routingJobId: string;
    totalDistanceKm: string; // decimal comes back as string from TypeORM
    nnDistanceKm: string;
    executionTimeMs: number;
    stopSequence: {
        lat: number;
        lng: number;
        dropPoint: string;
        shipmentId: string;
    }[];
    createdAt: string;
}

export interface RoutingJob {
    id: string;
    status: string;
    routingResult: RoutingResult | null;
    createdAt: string;
    completedAt: string | null;
}

export interface DeliveryJob {
    id: string;
    truck: Truck;
    created_by: User;
    status: DeliveryJobStatus;
    selectedResult: AlgorithmResult | null;
    packingJob: PackingJob;
    routingJob: RoutingJob | null;
    shipments: Shipment[];
    driverAssignments: DriverAssignment[];
    createdAt: string;
    updatedAt: string;
}
