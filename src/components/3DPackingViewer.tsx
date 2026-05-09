import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
    gridColor: string;
    gridOpacity: number;
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
        gridColor: "#38BDF8",
        gridOpacity: 0.08,
    },
    light: {
        // Scene — pale overcast sky feel
        sceneBg: "#f5f5f4",
        // Truck container
        containerFill: "#2563eb",
        containerOpacity: 0.06,
        frontWallOpacity: 0.15,
        topWallOpacity: 0.08,
        floorColor: "#e7e5e4",
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
        gridColor: "#1d4ed8",
        gridOpacity: 0.12,
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

// truck cab
function TruckCab({
    truck,
}: {
    truck: TruckDimensions;
    platformHeight: number;
}) {
    const { scene } = useGLTF("/models/man-truck.glb");
    const hh = truck.height_cm / 2;
    const hl = truck.length_cm / 2;

    const { cloned, scale, cabScaledLength } = useMemo(() => {
        const c = scene.clone();
        c.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                const mat = (
                    mesh.material as THREE.MeshStandardMaterial
                ).clone();
                mat.metalness = 0.4;
                mat.roughness = 0.6;
                mesh.material = mat;
            }
        });
        const box = new THREE.Box3().setFromObject(c);
        const size = new THREE.Vector3();
        box.getSize(size);
        const sc = truck.width_cm / size.x;
        return { cloned: c, scale: sc, cabScaledLength: size.z * sc };
    }, [scene, truck.width_cm]);

    // Back of cab (coupling) aligns with container front face at z = -hl
    return (
        <primitive
            object={cloned}
            position={[0, -hh, -hl - cabScaledLength / 1000]}
            scale={scale}
            rotation={[0, Math.PI, 0]}
        />
    );
}
useGLTF.preload("/models/man-truck.glb");
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

    const gridDivisions = Math.max(4, Math.round(truck.width_cm / 50));

    const gridHelper = useMemo(() => {
        const helper = new THREE.GridHelper(
            truck.width_cm,
            gridDivisions,
            new THREE.Color(palette.gridColor),
            new THREE.Color(palette.gridColor),
        );
        helper.scale.z = truck.length_cm / truck.width_cm;
        const mat = helper.material as THREE.LineBasicMaterial;
        mat.opacity = palette.gridOpacity;
        mat.transparent = true;
        return helper;
    }, [
        truck.width_cm,
        truck.length_cm,
        gridDivisions,
        palette.gridColor,
        palette.gridOpacity,
    ]);

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

            {/* solid floor */}
            <mesh position={[0, -hh + 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[truck.width_cm, truck.length_cm]} />
                <meshBasicMaterial
                    color={palette.floorColor}
                    side={THREE.DoubleSide}
                />
            </mesh>

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

            <primitive object={gridHelper} position={[0, -hh + 2, 0]} />

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

            {/* <TruckCabAndTires truck={truck} palette={palette} /> */}
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

function CartesianEnvironment({
    truck,
    palette,
    platformHeight,
}: {
    truck: TruckDimensions;
    palette: Palette;
    platformHeight: number;
}) {
    const hw = truck.width_cm / 2;
    const hh = truck.height_cm / 2;
    const hl = truck.length_cm / 2;
    const floorY = -hh;
    const containerFloorY = floorY + platformHeight;

    const CELL = 100; // 1 m per cell
    const pad = Math.max(truck.length_cm, truck.width_cm) * 1.2;
    const floorW = truck.width_cm + pad * 2;
    const floorD = truck.length_cm + pad * 2;
    const wallH = truck.height_cm * 1.3;

    const floorLines = useMemo(() => {
        const pts: number[] = [];
        const hw2 = floorW / 2;
        const hd2 = floorD / 2;
        const nW = Math.ceil(hw2 / CELL);
        const nD = Math.ceil(hd2 / CELL);
        for (let i = -nW; i <= nW; i++) {
            const x = i * CELL;
            pts.push(x, 0, -hd2, x, 0, hd2);
        }
        for (let j = -nD; j <= nD; j++) {
            const z = j * CELL;
            pts.push(-hw2, 0, z, hw2, 0, z);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return g;
    }, [floorW, floorD]);

    const backWallLines = useMemo(() => {
        const pts: number[] = [];
        const hw2 = floorW / 2;
        const nW = Math.ceil(hw2 / CELL);
        const nH = Math.ceil(wallH / CELL);
        for (let i = -nW; i <= nW; i++) {
            const x = i * CELL;
            pts.push(x, 0, 0, x, wallH, 0);
        }
        for (let j = 0; j <= nH; j++) {
            const y = j * CELL;
            if (y <= wallH) pts.push(-hw2, y, 0, hw2, y, 0);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return g;
    }, [floorW, wallH]);

    const sideWallLines = useMemo(() => {
        const pts: number[] = [];
        const hd2 = floorD / 2;
        const nD = Math.ceil(hd2 / CELL);
        const nH = Math.ceil(wallH / CELL);
        for (let j = -nD; j <= nD; j++) {
            const z = j * CELL;
            pts.push(0, 0, z, 0, wallH, z);
        }
        for (let k = 0; k <= nH; k++) {
            const y = k * CELL;
            if (y <= wallH) pts.push(0, y, -hd2, 0, y, hd2);
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        return g;
    }, [floorD, wallH]);

    const c = palette.gridColor;
    const o = palette.gridOpacity;
    const fs = Math.max(truck.height_cm * 0.12, 30);

    const zTicks = useMemo(() => {
        const steps = Math.ceil(truck.length_cm / CELL);
        return Array.from({ length: steps + 1 }, (_, i) => ({
            pos: -hl + i * CELL,
            label: String(i),
        }));
    }, [truck.length_cm, hl]);

    const xTicks = useMemo(() => {
        const steps = Math.ceil(truck.width_cm / CELL);
        return Array.from({ length: steps + 1 }, (_, i) => ({
            pos: -hw + i * CELL,
            label: String(i),
        }));
    }, [truck.width_cm, hw]);

    const yTicks = useMemo(() => {
        const steps = Math.ceil(truck.height_cm / CELL);
        return Array.from({ length: steps + 1 }, (_, i) => ({
            pos: i * CELL,
            label: String(i),
        }));
    }, [truck.height_cm]);

    return (
        <group>
            <mesh position={[0, floorY - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[floorW, floorD]} />
                <meshBasicMaterial
                    color={palette.floorColor}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Floor grid */}
            <lineSegments geometry={floorLines} position={[0, floorY, 0]}>
                <lineBasicMaterial
                    color={c}
                    transparent
                    opacity={o}
                    depthWrite={false}
                />
            </lineSegments>

            {/* Back wall (z = -hl, front of truck / cab side) */}
            <group position={[0, floorY, -hl]}>
                <lineSegments geometry={backWallLines}>
                    <lineBasicMaterial
                        color={c}
                        transparent
                        opacity={o}
                        depthWrite={false}
                    />
                </lineSegments>
            </group>

            {/* Left side wall (x = -hw) */}
            <group position={[-hw, floorY, 0]}>
                <lineSegments geometry={sideWallLines}>
                    <lineBasicMaterial
                        color={c}
                        transparent
                        opacity={o}
                        depthWrite={false}
                    />
                </lineSegments>
            </group>

            {/* Z axis labels — along left edge of floor */}
            {zTicks.map(({ pos, label }) => (
                <Text
                    key={`z-${label}`}
                    position={[-hw - fs * 1.8, containerFloorY, pos]}
                    fontSize={fs}
                    color={c}
                    anchorX="right"
                    anchorY="middle"
                >
                    {label}
                </Text>
            ))}

            {/* X axis labels — along front edge of floor */}
            {xTicks.map(({ pos, label }) => (
                <Text
                    key={`x-${label}`}
                    position={[pos, containerFloorY, -hl - fs * 1.8]}
                    fontSize={fs}
                    color={c}
                    anchorX="center"
                    anchorY="top"
                >
                    {label}
                </Text>
            ))}

            {/* Y axis labels — along back-left vertical edge */}
            {yTicks.map(({ pos, label }) => (
                <Text
                    key={`y-${label}`}
                    position={[-hw - fs * 1.8, containerFloorY + pos, -hl]}
                    fontSize={fs}
                    color={c}
                    anchorX="right"
                    anchorY="middle"
                >
                    {label}
                </Text>
            ))}
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
    const PLATFORM_HEIGHT = 90;

    return (
        <>
            <ambientLight intensity={1.5} />
            <directionalLight
                position={[-500, 800, -600]}
                intensity={2}
                color="#ffffff"
            />
            <directionalLight
                position={[500, 400, -800]}
                intensity={1.2}
                color="#cce0ff"
            />
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
            <CartesianEnvironment
                truck={truck}
                palette={palette}
                platformHeight={PLATFORM_HEIGHT}
            />
            <group position={[0, PLATFORM_HEIGHT, 0]}>
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
            </group>

            <TruckCab truck={truck} platformHeight={PLATFORM_HEIGHT} />
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
    const [isDark, setIsDark] = useState(() =>
        document.documentElement.classList.contains("dark"),
    );
    const [selectedShipmentId, setSelectedShipmentId] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    const palette = PALETTES[isDark ? "dark" : "light"];

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
                key={isDark ? "dark" : "light"}
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
