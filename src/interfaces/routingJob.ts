export interface RouteStop {
    shipmentId: string;
    lat: number;
    lng: number;
    dropPoint: string;
}

export interface RoutingResult {
    id: string;
    routingJobId: string;
    totalDistanceKm: string;
    nnDistanceKm: string;
    executionTimeMs: number;
    stopSequence: RouteStop[];
    createdAt: string;
}

export interface RoutingJob {
    id: string;
    status: "pending" | "running" | "completed" | "failed";
    companyId: string;
    triggeredById: string;
    deliveryJobId: string;
    createdAt: string;
    completedAt: string | null;
    routingResult: RoutingResult | null;
}
