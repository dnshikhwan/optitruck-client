import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import {
    ArrowLeft,
    ArrowRight,
    Maximize2,
    Minimize2,
    Pause,
    Play,
    RotateCcw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PackingItem {
    id: string;
    name: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    weight_kg: string;
    color_hex: string;
    shipmentId: string;
    shipmentName: string;
    stopIndex?: number;
}

export interface PlacedItem {
    item: PackingItem;
    x_coordinate: number;
    y_coordinate: number;
    z_coordinate: number;
    width_cm: number;
    height_cm: number;
    length_cm: number;
}

export interface PackingResult {
    placedItems: PlacedItem[];
    unplacedItems: PackingItem[];
    usedVolumePercent: number;
    wastedVolumePercent: number;
}

export interface TruckDimensions {
    length_cm: number;
    width_cm: number;
    height_cm: number;
}

interface PackingViewerProps {
    truck: TruckDimensions;
    result?: PackingResult;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme palettes
// All Three.js colors and HTML overlay styles come from here.
// Swapping the palette is the only thing needed to change the entire look.
// ─────────────────────────────────────────────────────────────────────────────

interface Palette {
    // Scene
    sceneBg: string;
    // Truck container
    containerFill: string;
    containerOpacity: number;
    frontWallOpacity: number;
    topWallOpacity: number;
    floorColor: string;
    edgeColor: string;
    centerLineOpacity: number;
    // Labels inside 3D scene
    frontLabel: string;
    rearLabel: string;
    // Cab
    cabFill: string;
    cabOpacity: number;
    cabEdgeColor: string;
    windshieldColor: string;
    // Ghost (dimmed) boxes
    ghostColor: string;
    ghostOpacity: number;
    // HTML overlay
    hudText: string;
    pillBg: string;
    pillText: string;
    legendBg: string;
    legendText: string;
    legendMutedText: string;
    legendHoverBg: string;
    legendSelectedBg: string;
    legendBorderColor: string;
}

const PALETTES: Record<"dark" | "light", Palette> = {
    dark: {
        // Scene
        sceneBg: "#080f1f",
        // Truck container
        containerFill: "#1e3a5f",
        containerOpacity: 0.18,
        frontWallOpacity: 0.55,
        topWallOpacity: 0.3,
        floorColor: "#152540",
        edgeColor: "#38BDF8",
        centerLineOpacity: 0.6,
        // Labels
        frontLabel: "#38BDF8",
        rearLabel: "#7DD3FC",
        // Cab
        cabFill: "#0d2240",
        cabOpacity: 0.93,
        cabEdgeColor: "#38BDF8",
        windshieldColor: "#7dd3fc",
        // Ghost
        ghostColor: "#ffffff",
        ghostOpacity: 0.02,
        // HTML overlay
        hudText: "#38BDF8aa",
        pillBg: "rgba(8,15,31,0.85)",
        pillText: "#ffffff",
        legendBg: "rgba(0,0,0,0.55)",
        legendText: "rgba(255,255,255,0.9)",
        legendMutedText: "rgba(255,255,255,0.4)",
        legendHoverBg: "rgba(255,255,255,0.08)",
        legendSelectedBg: "rgba(59,130,246,0.45)",
        legendBorderColor: "rgba(255,255,255,0.1)",
    },
    light: {
        // Scene — pale overcast sky feel
        sceneBg: "#dde8f2",
        // Truck container
        containerFill: "#2563eb",
        containerOpacity: 0.06,
        frontWallOpacity: 0.15,
        topWallOpacity: 0.08,
        floorColor: "#b8cfe4",
        edgeColor: "#1d4ed8",
        centerLineOpacity: 0.5,
        // Labels
        frontLabel: "#1d4ed8",
        rearLabel: "#2563eb",
        // Cab
        cabFill: "#bfdbfe",
        cabOpacity: 0.92,
        cabEdgeColor: "#1d4ed8",
        windshieldColor: "#3b82f6",
        // Ghost — dark tint instead of white for light backgrounds
        ghostColor: "#1e3a5f",
        ghostOpacity: 0.04,
        // HTML overlay
        hudText: "#1d4ed8",
        pillBg: "rgba(255,255,255,0.85)",
        pillText: "#0f172a",
        legendBg: "rgba(255,255,255,0.82)",
        legendText: "rgba(15,23,42,0.9)",
        legendMutedText: "rgba(15,23,42,0.4)",
        legendHoverBg: "rgba(15,23,42,0.06)",
        legendSelectedBg: "rgba(59,130,246,0.18)",
        legendBorderColor: "rgba(15,23,42,0.1)",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Texture cache
// Keyed by "color:name" so we never redraw the same canvas twice.
// ─────────────────────────────────────────────────────────────────────────────

const textureCache = new Map<
    string,
    {
        side: THREE.CanvasTexture;
        top: THREE.CanvasTexture;
        bottom: THREE.CanvasTexture;
        materials: THREE.MeshBasicMaterial[];
    }
>();

function getOrCreateTextures(color_hex: string, name: string) {
    const key = `${color_hex}:${name}`;
    if (textureCache.has(key)) return textureCache.get(key)!;

    const drawText = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "rgba(240, 235, 220, 0.9)";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = name.split(" ");
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
            if ((current + " " + word).trim().length > 10) {
                lines.push(current.trim());
                current = word;
            } else {
                current += " " + word;
            }
        }
        lines.push(current.trim());
        const lineHeight = 44;
        const startY = 128 - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, i) =>
            ctx.fillText(line, 128, startY + i * lineHeight),
        );
    };

    const sideCanvas = document.createElement("canvas");
    sideCanvas.width = 256;
    sideCanvas.height = 256;
    const sctx = sideCanvas.getContext("2d")!;
    sctx.fillStyle = color_hex;
    sctx.fillRect(0, 0, 256, 256);
    sctx.fillStyle = "rgba(0,0,0,0.35)";
    sctx.fillRect(0, 205, 256, 51);
    drawText(sctx);

    const topCanvas = document.createElement("canvas");
    topCanvas.width = 256;
    topCanvas.height = 256;
    const tctx = topCanvas.getContext("2d")!;
    tctx.fillStyle = color_hex;
    tctx.fillRect(0, 0, 256, 256);
    drawText(tctx);

    const bottomCanvas = document.createElement("canvas");
    bottomCanvas.width = 256;
    bottomCanvas.height = 256;
    const bctx = bottomCanvas.getContext("2d")!;
    bctx.fillStyle = "rgba(0,0,0,0.5)";
    bctx.fillRect(0, 0, 256, 256);

    const side = new THREE.CanvasTexture(sideCanvas);
    const top = new THREE.CanvasTexture(topCanvas);
    const bottom = new THREE.CanvasTexture(bottomCanvas);

    const materials = [
        new THREE.MeshBasicMaterial({ map: side }),
        new THREE.MeshBasicMaterial({ map: side }),
        new THREE.MeshBasicMaterial({ map: top }),
        new THREE.MeshBasicMaterial({ map: bottom }),
        new THREE.MeshBasicMaterial({ map: side }),
        new THREE.MeshBasicMaterial({ map: side }),
    ];

    const entry = { side, top, bottom, materials };
    textureCache.set(key, entry);
    return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// TruckCabAndTires
// ─────────────────────────────────────────────────────────────────────────────

function TruckCabAndTires({
    truck,
    palette,
}: {
    truck: TruckDimensions;
    palette: Palette;
}) {
    const hw = truck.width_cm / 2;
    const hh = truck.height_cm / 2;
    const hl = truck.length_cm / 2;

    const cabLength = Math.min(truck.length_cm * 0.3, truck.height_cm * 1.1);
    const cabHeight = truck.height_cm * 0.78;
    const cabHalfL = cabLength / 2;
    const cabHalfH = cabHeight / 2;

    const cabCenterZ = -hl - cabHalfL;
    const cabCenterY = -hh + cabHalfH;

    const cabEdgesGeo = useMemo(
        () =>
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(truck.width_cm, cabHeight, cabLength),
            ),
        [truck.width_cm, cabHeight, cabLength],
    );

    const tireRadius = truck.height_cm * 0.25;
    const tireThick = truck.width_cm * 0.25;
    const tireY = -hh;

    const axles = [-hl - cabLength * 0.55, hl - tireRadius * 2.5];

    const tireXs = [-(hw + tireThick * 0.5), hw + tireThick * 0.5];

    return (
        <group>
            {/* Cab body */}
            <mesh position={[0, cabCenterY, cabCenterZ]}>
                <boxGeometry args={[truck.width_cm, cabHeight, cabLength]} />
                <meshBasicMaterial
                    color={palette.cabFill}
                    transparent
                    opacity={palette.cabOpacity}
                />
            </mesh>

            {/* Cab edges */}
            <lineSegments
                geometry={cabEdgesGeo}
                position={[0, cabCenterY, cabCenterZ]}
            >
                <lineBasicMaterial color={palette.cabEdgeColor} />
            </lineSegments>

            {/* Windshield */}
            <mesh
                position={[
                    0,
                    cabCenterY + cabHalfH * 0.1,
                    cabCenterZ - cabHalfL + 0.5,
                ]}
                rotation={[0.12, 0, 0]}
            >
                <planeGeometry
                    args={[truck.width_cm * 0.72, cabHeight * 0.55]}
                />
                <meshBasicMaterial
                    color={palette.windshieldColor}
                    transparent
                    opacity={0.22}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Headlights */}
            {([-hw * 0.55, hw * 0.55] as number[]).map((x) => (
                <mesh
                    key={x}
                    position={[
                        x,
                        cabCenterY - cabHalfH * 0.3,
                        cabCenterZ - cabHalfL + 0.3,
                    ]}
                >
                    <planeGeometry
                        args={[truck.width_cm * 0.12, truck.height_cm * 0.06]}
                    />
                    <meshBasicMaterial
                        color="#fef9c3"
                        transparent
                        opacity={0.9}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Tires */}
            {axles.map((z) =>
                tireXs.map((x) => (
                    <group key={`${z}-${x}`} position={[x, tireY, z]}>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry
                                args={[tireRadius, tireRadius, tireThick, 20]}
                            />
                            <meshBasicMaterial color="#111827" />
                        </mesh>
                        <mesh rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry
                                args={[
                                    tireRadius * 0.52,
                                    tireRadius * 0.52,
                                    tireThick + 1,
                                    12,
                                ]}
                            />
                            <meshBasicMaterial color="#4b5563" />
                        </mesh>
                    </group>
                )),
            )}
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TruckContainer
// ─────────────────────────────────────────────────────────────────────────────

function TruckContainer({
    truck,
    palette,
}: {
    truck: TruckDimensions;
    palette: Palette;
}) {
    const hh = truck.height_cm / 2;
    const hl = truck.length_cm / 2;

    const edgesGeo = useMemo(
        () =>
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(
                    truck.width_cm,
                    truck.height_cm,
                    truck.length_cm,
                ),
            ),
        [truck.width_cm, truck.height_cm, truck.length_cm],
    );

    const centerLinePoints = useMemo(
        () => new Float32Array([0, -hh, 0, 0, hh, 0]),
        [hh],
    );

    return (
        <group>
            {/* Translucent box body */}
            <mesh>
                <boxGeometry
                    args={[truck.width_cm, truck.height_cm, truck.length_cm]}
                />
                <meshBasicMaterial
                    color={palette.containerFill}
                    transparent
                    opacity={palette.containerOpacity}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Glowing edges */}
            <lineSegments geometry={edgesGeo}>
                <lineBasicMaterial color={palette.edgeColor} />
            </lineSegments>

            {/* Front wall (more opaque so depth is readable) */}
            <mesh position={[0, 0, -hl]}>
                <planeGeometry args={[truck.width_cm, truck.height_cm]} />
                <meshBasicMaterial
                    color={palette.containerFill}
                    transparent
                    opacity={palette.frontWallOpacity}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Top wall */}
            <mesh position={[0, hh, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[truck.width_cm, truck.length_cm]} />
                <meshBasicMaterial
                    color={palette.containerFill}
                    transparent
                    opacity={palette.topWallOpacity}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Floor */}
            <mesh position={[0, -hh + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[truck.width_cm, truck.length_cm]} />
                <meshBasicMaterial
                    color={palette.floorColor}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* FRONT label */}
            <Text
                position={[0, hh * 0.3, -hl + truck.height_cm * 0.1]}
                fontSize={truck.height_cm * 0.1}
                color={palette.frontLabel}
                anchorX="center"
                anchorY="middle"
            >
                FRONT
            </Text>

            {/* REAR label */}
            <Text
                position={[0, hh * 0.3, hl - truck.height_cm * 0.1]}
                fontSize={truck.height_cm * 0.1}
                color={palette.rearLabel}
                anchorX="center"
                anchorY="middle"
                rotation={[0, Math.PI, 0]}
            >
                REAR
            </Text>

            {/* Centre vertical line at rear opening */}
            <lineSegments position={[0, 0, hl]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[centerLinePoints, 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial
                    color={palette.edgeColor}
                    transparent
                    opacity={palette.centerLineOpacity}
                />
            </lineSegments>

            <TruckCabAndTires truck={truck} palette={palette} />
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatPill — small overlay badge showing a number + label
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({
    label,
    value,
    accent,
    palette,
    isFullscreen,
}: {
    label: string;
    value: string | number;
    accent: string;
    palette: Palette;
    isFullscreen: boolean;
}) {
    return (
        <div
            style={{
                background: palette.pillBg,
                border: `1px solid ${accent}55`,
            }}
            className={`text-center rounded-lg backdrop-blur-sm ${
                isFullscreen ? "px-5 py-3" : "px-3 py-1.5"
            }`}
        >
            <div
                className={`uppercase tracking-widest mb-0.5 ${
                    isFullscreen ? "text-xs" : "text-[9px]"
                }`}
                style={{ color: accent }}
            >
                {label}
            </div>
            <div
                className={`font-medium leading-none ${
                    isFullscreen ? "text-3xl" : "text-[18px]"
                }`}
                style={{ color: palette.pillText }}
            >
                {value}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatsOverlay — top-left HUD with placed / unplaced / volume
// ─────────────────────────────────────────────────────────────────────────────
function StatsOverlay({
    result,
    palette,
    isFullscreen,
}: {
    result: PackingResult;
    palette: Palette;
    isFullscreen: boolean;
}) {
    return (
        <div
            className={`absolute flex pointer-events-none ${
                isFullscreen ? "top-6 left-6 gap-4" : "top-3 left-3 gap-2"
            }`}
        >
            <StatPill
                label="Placed"
                value={result.placedItems.length}
                accent="#34D399"
                palette={palette}
                isFullscreen={isFullscreen}
            />
            <StatPill
                label="Unplaced"
                value={result.unplacedItems.length}
                accent="#F87171"
                palette={palette}
                isFullscreen={isFullscreen}
            />
            <StatPill
                label="Volume"
                value={`${Number(result.usedVolumePercent).toFixed(1)} %`}
                accent="#38BDF8"
                palette={palette}
                isFullscreen={isFullscreen}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CargoBox — a single placed item rendered as a textured cube
// ─────────────────────────────────────────────────────────────────────────────

function CargoBox({
    placed,
    truckHalfW,
    truckHalfH,
    truckHalfL,
    isSelected,
    isDimmed,
    palette,
    onClick,
}: {
    placed: PlacedItem;
    truckHalfW: number;
    truckHalfH: number;
    truckHalfL: number;
    isSelected: boolean;
    isDimmed: boolean;
    palette: Palette;
    onClick: () => void;
}) {
    const { item, x_coordinate, y_coordinate, z_coordinate } = placed;
    const { color_hex, name } = item;

    const w = placed.width_cm;
    const h = placed.height_cm;
    const l = placed.length_cm;

    // Convert bottom-left-front corner coordinates to Three.js center position.
    // Three.js places mesh origin at the center of the box, so we shift by half-dimensions.
    const cx = -truckHalfW + x_coordinate + w / 2;
    const cy = -truckHalfH + y_coordinate + h / 2;
    const cz = -truckHalfL + z_coordinate + l / 2;

    const edgesGeo = useMemo(
        () => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, l)),
        [w, h, l],
    );

    // Ghost material is created per-box so it can pick up palette colors.
    // It is memoized so it only recreates when the palette changes.
    const ghostMaterial = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: palette.ghostColor,
                transparent: true,
                opacity: palette.ghostOpacity,
                depthWrite: false,
            }),
        [palette.ghostColor, palette.ghostOpacity],
    );

    // Textures come from the module-level cache — no canvas redraws for repeated items
    const { materials } = useMemo(
        () => getOrCreateTextures(color_hex, name),
        [color_hex, name],
    );

    const edgeColor =
        isDimmed && !isSelected
            ? palette.ghostColor
            : isSelected
              ? "#38bdf8"
              : "#000000";
    const edgeOpacity =
        isDimmed && !isSelected ? 0.12 : isSelected ? 0.85 : 0.2;

    return (
        <group position={[cx, cy, cz]}>
            {/* The box face — textured when visible, ghost when dimmed */}
            <mesh
                material={isDimmed && !isSelected ? ghostMaterial : materials}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerEnter={() => {
                    document.body.style.cursor = "pointer";
                }}
                onPointerLeave={() => {
                    document.body.style.cursor = "default";
                }}
            >
                <boxGeometry args={[w, h, l]} />
            </mesh>

            {/* Edge lines around the box */}
            <lineSegments geometry={edgesGeo}>
                <lineBasicMaterial
                    color={edgeColor}
                    transparent
                    opacity={edgeOpacity}
                />
            </lineSegments>

            {/* Selection halo — a slightly scaled translucent shell rendered from inside */}
            {isSelected && (
                <mesh scale={[1.05, 1.05, 1.05]}>
                    <boxGeometry args={[w, h, l]} />
                    <meshBasicMaterial
                        color={0x38bdf8}
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                    />
                </mesh>
            )}
        </group>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene — everything that lives inside the Three.js Canvas
// ─────────────────────────────────────────────────────────────────────────────

function Scene({
    truck,
    result,
    selectedShipmentId,
    onShipmentSelect,
    diagonal,
    palette,
}: {
    truck: TruckDimensions;
    result?: PackingResult;
    selectedShipmentId: string;
    onShipmentSelect: (shipmentId: string) => void;
    diagonal: number;
    palette: Palette;
}) {
    const hw = truck.width_cm / 2;
    const hh = truck.height_cm / 2;
    const hl = truck.length_cm / 2;

    const { scene, invalidate } = useThree();

    // Mutate the scene background whenever the palette changes.
    // This is the only way to reach the Three.js background from outside the Canvas.
    useEffect(() => {
        scene.background = new THREE.Color(palette.sceneBg);
        invalidate();
    }, [palette.sceneBg, scene, invalidate]);

    return (
        <>
            <ambientLight color="#8aaed4" intensity={0.6} />
            <directionalLight
                position={[400, 600, 300]}
                intensity={1.0}
                color="#cce0ff"
            />
            <directionalLight
                position={[-300, -200, -200]}
                color="#1a3a6a"
                intensity={0.5}
            />

            <TruckContainer truck={truck} palette={palette} />

            {result?.placedItems.map((placed, i) => {
                const itemShipmentId = placed.item.shipmentId;
                const isSelected = selectedShipmentId === itemShipmentId;
                const isDimmed = selectedShipmentId !== "" && !isSelected;

                return (
                    <CargoBox
                        key={`${placed.item.id}-${i}`}
                        placed={placed}
                        truckHalfW={hw}
                        truckHalfH={hh}
                        truckHalfL={hl}
                        isSelected={isSelected}
                        isDimmed={isDimmed}
                        palette={palette}
                        onClick={() => onShipmentSelect(itemShipmentId)}
                    />
                );
            })}

            <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={100}
                maxDistance={diagonal * 5}
                target={[0, 0, 0]}
                maxPolarAngle={Math.PI / 1.8}
                onChange={() => invalidate()}
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PackingViewer — the main exported component
// ─────────────────────────────────────────────────────────────────────────────

export function PackingViewer({
    truck,
    result,
    className,
}: PackingViewerProps) {
    // useTheme comes from next-themes, which shadcn sets up automatically.
    // resolvedTheme is preferred over theme because it resolves "system" to the
    // actual OS preference — so your viewer always gets "dark" or "light", never "system".
    const { resolvedTheme } = useTheme();
    const palette = PALETTES[resolvedTheme === "light" ? "light" : "dark"];

    const [selectedShipmentId, setSelectedShipmentId] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const diagonal = Math.sqrt(
        truck.width_cm ** 2 + truck.height_cm ** 2 + truck.length_cm ** 2,
    );
    const initialCameraPos: [number, number, number] = [
        diagonal * 0.6,
        diagonal * 0.5,
        diagonal * 0.7,
    ];

    const [currentStep, setCurrentStep] = useState(1);
    const [playing, setPlaying] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalItems = result?.placedItems.length ?? 0;

    // Playback ticker — advances currentStep every 50 ms while playing is true
    useEffect(() => {
        if (playing) {
            intervalRef.current = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= totalItems) {
                        setPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 50);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [playing, totalItems]);

    // Reset the viewer whenever a new packing result arrives
    useEffect(() => {
        setCurrentStep(0);
        setPlaying(false);
        setSelectedShipmentId("");
    }, [result]);

    const toggleFullscreen = () => {
        // If nothing is currently fullscreen, request fullscreen on our container.
        // Otherwise, exit fullscreen mode.
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement === containerRef.current,
            );
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    // Only show boxes up to currentStep — this drives the step-through animation
    const visibleResult = result
        ? { ...result, placedItems: result.placedItems.slice(0, currentStep) }
        : undefined;

    // Build the shipment legend, sorted by stop index so stop 1 appears first
    const sortedShipmentEntries = useMemo(() => {
        const shipmentMap = new Map<
            string,
            {
                color: string;
                count: number;
                shipmentName: string;
                stopIndex: number;
            }
        >();

        result?.placedItems.forEach((placed) => {
            const shipmentId = placed.item.shipmentId;
            if (shipmentId) {
                const existing = shipmentMap.get(shipmentId);
                if (existing) {
                    existing.count++;
                } else {
                    shipmentMap.set(shipmentId, {
                        color: placed.item.color_hex,
                        count: 1,
                        shipmentName:
                            placed.item.shipmentName ||
                            `Shipment ${shipmentId.slice(-8)}`,
                        stopIndex: placed.item.stopIndex ?? 0,
                    });
                }
            }
        });

        return Array.from(shipmentMap.entries()).sort(
            ([, a], [, b]) => a.stopIndex - b.stopIndex,
        );
    }, [result]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full rounded-xl overflow-hidden ${className ?? ""}`}
            style={{ background: palette.sceneBg }}
            onWheel={(e) => e.stopPropagation()}
        >
            {/* Three.js Canvas — frameloop="demand" means it only re-renders when
                invalidate() is called (e.g. on OrbitControls change), saving GPU. */}
            <Canvas
                key={resolvedTheme ?? "dark"}
                frameloop="demand"
                camera={{
                    fov: 50,
                    near: 1,
                    far: diagonal * 10,
                    position: initialCameraPos,
                }}
            >
                <Suspense fallback={null}>
                    <Scene
                        result={visibleResult}
                        truck={truck}
                        selectedShipmentId={selectedShipmentId}
                        onShipmentSelect={setSelectedShipmentId}
                        diagonal={diagonal}
                        palette={palette}
                    />
                </Suspense>
            </Canvas>

            {/* Shipment legend — only shown when there are multiple shipments */}
            {sortedShipmentEntries.length > 1 && (
                <div
                    className="absolute top-3 right-3 rounded-lg p-3 pointer-events-auto max-h-96 overflow-y-auto backdrop-blur-sm"
                    style={{
                        background: palette.legendBg,
                        border: `1px solid ${palette.legendBorderColor}`,
                    }}
                >
                    <div
                        className="text-xs mb-2 font-semibold"
                        style={{ color: palette.legendMutedText }}
                    >
                        Shipments ({sortedShipmentEntries.length})
                    </div>
                    <div className="space-y-1">
                        {sortedShipmentEntries.map(
                            ([
                                shipmentId,
                                { color, count, shipmentName, stopIndex },
                            ]) => (
                                <button
                                    key={shipmentId}
                                    onClick={() =>
                                        setSelectedShipmentId(
                                            selectedShipmentId === shipmentId
                                                ? ""
                                                : shipmentId,
                                        )
                                    }
                                    style={{
                                        color:
                                            selectedShipmentId === shipmentId
                                                ? palette.pillText
                                                : palette.legendMutedText,
                                        background:
                                            selectedShipmentId === shipmentId
                                                ? palette.legendSelectedBg
                                                : "transparent",
                                    }}
                                    className="flex items-center justify-between gap-3 w-full text-left px-2 py-1.5 rounded text-xs transition-colors hover:opacity-80"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span
                                            className="truncate font-medium"
                                            style={{
                                                color: palette.legendText,
                                            }}
                                        >
                                            {shipmentName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span
                                            style={{
                                                color: palette.legendMutedText,
                                                fontSize: "10px",
                                            }}
                                        >
                                            Stop {stopIndex + 1}
                                        </span>
                                        <span
                                            style={{
                                                color: palette.legendMutedText,
                                                fontSize: "10px",
                                            }}
                                        >
                                            {count} item{count !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </button>
                            ),
                        )}
                        {selectedShipmentId && (
                            <button
                                onClick={() => setSelectedShipmentId("")}
                                style={{
                                    color: palette.legendMutedText,
                                    borderTop: `1px solid ${palette.legendBorderColor}`,
                                }}
                                className="w-full text-left px-2 py-1.5 rounded text-xs mt-2 pt-2 hover:opacity-70 transition-opacity"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>
                </div>
            )}

            <Button
                size={isFullscreen ? "lg" : "sm"}
                variant="secondary"
                onClick={toggleFullscreen}
                className={`absolute backdrop-blur-sm ${
                    isFullscreen ? "bottom-6 left-6" : "bottom-3 left-3"
                }`}
                style={{
                    background: palette.pillBg,
                    color: palette.pillText,
                    border: `1px solid ${palette.legendBorderColor}`,
                }}
            >
                {isFullscreen ? (
                    <Minimize2 className="h-6 w-6" />
                ) : (
                    <Maximize2 className="h-4 w-4" />
                )}
            </Button>

            {/* Step-through playback controls */}
            <div
                className={`absolute left-0 right-0 flex items-center justify-center ${
                    isFullscreen ? "bottom-16 gap-5" : "bottom-10 gap-3"
                }`}
            >
                <Button
                    size={isFullscreen ? "lg" : "sm"}
                    onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                >
                    <ArrowLeft
                        className={isFullscreen ? "h-6 w-6" : "h-4 w-4"}
                    />
                </Button>
                <Button
                    size={isFullscreen ? "lg" : "sm"}
                    variant="destructive"
                    onClick={() => {
                        if (currentStep >= totalItems) setCurrentStep(0);
                        setPlaying((p) => !p);
                    }}
                    className="rounded-full"
                >
                    {currentStep === totalItems ? (
                        <RotateCcw
                            className={isFullscreen ? "h-6 w-6" : "h-4 w-4"}
                        />
                    ) : playing ? (
                        <Pause
                            className={isFullscreen ? "h-6 w-6" : "h-4 w-4"}
                        />
                    ) : (
                        <Play
                            className={isFullscreen ? "h-6 w-6" : "h-4 w-4"}
                        />
                    )}
                </Button>
                <Button
                    size={isFullscreen ? "lg" : "sm"}
                    onClick={() =>
                        setCurrentStep((s) => Math.min(totalItems, s + 1))
                    }
                >
                    <ArrowRight
                        className={isFullscreen ? "h-6 w-6" : "h-4 w-4"}
                    />
                </Button>
                <span
                    className={`font-mono ${isFullscreen ? "text-base" : "text-xs"}`}
                    style={{ color: palette.hudText }}
                >
                    {currentStep} / {totalItems}
                </span>
            </div>

            {/* Top-left stats HUD */}
            {result && (
                <StatsOverlay
                    result={result}
                    palette={palette}
                    isFullscreen={isFullscreen}
                />
            )}

            {/* Bottom-right dimension readout */}
            <div
                className="absolute bottom-3 right-3 text-[11px] font-mono pointer-events-none"
                style={{ color: palette.hudText }}
            >
                {truck.length_cm}×{truck.width_cm}×{truck.height_cm} cm · click
                on boxes to select shipments
            </div>
        </div>
    );
}
