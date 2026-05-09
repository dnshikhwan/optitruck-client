export async function fetchRoadGeometry(
    waypoints: [number, number][], // [lat, lng] pairs
): Promise<[number, number][]> {
    // OSRM expects lng,lat — opposite of Leaflet
    const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");

    const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    );

    if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);

    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) {
        throw new Error("No route returned from OSRM");
    }

    // GeoJSON is [lng, lat] → convert back to Leaflet [lat, lng]
    return data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
    );
}
