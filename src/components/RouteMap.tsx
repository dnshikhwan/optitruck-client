// RouteMap.tsx
import { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RouteStop } from "@/interfaces/routingJob";
import { fetchRoadGeometry } from "@/utils/routeMap.utils";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RouteMapProps {
    stops: RouteStop[];
    warehouseLat: number;
    warehouseLng: number;
    height?: string;
}

const warehouseIcon = L.divIcon({
    className: "",
    html: `<div style="background:#f97316;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const stopIcon = (index: number) =>
    L.divIcon({
        className: "",
        html: `<div style="background:#6366f1;color:white;width:22px;height:22px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;box-shadow:0 0 4px rgba(0,0,0,0.5)">${index + 1}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });

function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            map.fitBounds(positions, { padding: [40, 40] });
        }
    }, [positions, map]);
    return null;
}

// Renders the road-following polyline, fetches geometry itself
function RoadPolyline({ waypoints }: { waypoints: [number, number][] }) {
    const [roadCoords, setRoadCoords] = useState<[number, number][]>([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (waypoints.length < 2) return;

        fetchRoadGeometry(waypoints)
            .then(setRoadCoords)
            .catch(() => {
                // Graceful fallback: straight lines are better than nothing
                setError(true);
                setRoadCoords(waypoints);
            });
    }, [waypoints]);

    if (roadCoords.length === 0) return null;

    return (
        <Polyline
            positions={roadCoords}
            pathOptions={{
                color: error ? "#ef4444" : "#6366f1",
                weight: 4,
                // Solid line for real roads — dashes imply "approximate"
                dashArray: error ? "6 4" : undefined,
            }}
        />
    );
}

export function RouteMap({
    stops,
    warehouseLat,
    warehouseLng,
    height,
}: RouteMapProps) {
    const warehousePos: [number, number] = [warehouseLat, warehouseLng];

    const waypoints: [number, number][] = [
        warehousePos,
        ...stops.map((s) => [s.lat, s.lng] as [number, number]),
        warehousePos, // return to warehouse
    ];

    const allPositions: [number, number][] = [
        warehousePos,
        ...stops.map((s) => [s.lat, s.lng] as [number, number]),
    ];

    return (
        <MapContainer
            center={warehousePos}
            zoom={10}
            style={{
                height: height ?? "400px",
                width: "100%",
                borderRadius: "0.5rem",
            }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds positions={allPositions} />

            <Marker position={warehousePos} icon={warehouseIcon}>
                <Popup>Warehouse (Start / End)</Popup>
            </Marker>

            {stops.map((stop, index) => (
                <Marker
                    key={stop.shipmentId}
                    position={[stop.lat, stop.lng]}
                    icon={stopIcon(index)}
                >
                    <Popup>{stop.dropPoint}</Popup>
                </Marker>
            ))}

            <RoadPolyline waypoints={waypoints} />
        </MapContainer>
    );
}
