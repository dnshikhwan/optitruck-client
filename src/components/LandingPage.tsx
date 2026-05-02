import { Link, useNavigate } from "@tanstack/react-router";
import "../styles.css";
import { useAuth } from "@/auth";
import { Button } from "./ui/button";

const HERO_DARK = "oklch(0.148 0.004 228.8)"; // matches --foreground in light root
const CARD_DARK = "oklch(0.218 0.008 223.9)"; // matches dark card token
const LINE_DARK = "rgba(255,255,255,0.08)";

// Tiny helpers for repeated patterns
const ItalSerif = ({ children }: { children: React.ReactNode }) => (
    <span className="font-serif italic font-normal">{children}</span>
);

const Eyebrow = ({
    num,
    label,
    light = false,
}: {
    num: string;
    label: string;
    light?: boolean;
}) => (
    <span
        className={`inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase ${light ? "text-white/70" : "text-foreground/70"}`}
    >
        <span className="text-chart-3">{num}</span>
        <span>— {label}</span>
    </span>
);

const Check = () => (
    <span className="grid place-items-center w-5 h-5 mt-[2px] flex-shrink-0 bg-chart-3/15 text-chart-3">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path
                d="M2 6.5L4.5 9L10 3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </span>
);

// ============================================================
// NAV
// ============================================================
function Nav() {
    const { isAuthenticated, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    return (
        <nav className="sticky top-0 z-50 bg-secondary border-b border-border">
            <div className="max-w-[1280px] mx-auto px-8 flex items-center justify-between h-[68px]">
                <div className="flex items-center gap-2.5 font-semibold text-[17px] tracking-[-0.02em]">
                    <div className="w-7 h-7 bg-foreground text-secondary grid place-items-center">
                        <svg
                            viewBox="0 0 16 16"
                            fill="none"
                            className="w-4 h-4"
                        >
                            <rect
                                x="1.5"
                                y="4"
                                width="9"
                                height="7"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="1.4"
                            />
                            <path
                                d="M10.5 6h2.2L14.5 8v3h-4"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinejoin="round"
                            />
                            <circle
                                cx="4.5"
                                cy="12"
                                r="1.4"
                                fill="currentColor"
                            />
                            <circle
                                cx="11.5"
                                cy="12"
                                r="1.4"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    OptiTruck
                </div>
                <div className="flex gap-1 items-center">
                    {[
                        ["Algorithms", "#algorithms"],
                        ["3D Loading", "#loading"],
                        ["Routing", "#routing"],
                        ["How it works", "#how"],
                        ["Pricing", "#pricing"],
                    ].map(([label, href]) => (
                        <a
                            key={href}
                            href={href}
                            className="px-3.5 py-2 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition"
                        >
                            {label}
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-2.5">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                to="/auth/login"
                                search={{
                                    redirect: "",
                                }}
                            >
                                <a href="#" className="text-sm px-3.5 py-2">
                                    Sign in
                                </a>
                            </Link>
                            <button className="bg-primary text-primary-foreground px-4.5 py-2.5 text-sm font-medium hover:brightness-110 transition">
                                Get a demo
                            </button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() =>
                                    hasRole("manager")
                                        ? navigate({ to: "/manager" })
                                        : navigate({
                                              to: "/driver/active-assignments",
                                          })
                                }
                            >
                                Dashboard
                            </Button>
                            <Button
                                onClick={() => logout()}
                                variant={"outline"}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
    return (
        <section className="bg-secondary py-14 pb-20 relative overflow-hidden">
            <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
                {/* Text */}
                <div>
                    <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-chart-3 font-medium px-3 py-1.5 bg-chart-3/10 border border-chart-3/20">
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-chart-3 shadow-[0_0_0_3px_rgba(0,0,0,0)]"
                            style={{
                                boxShadow:
                                    "0 0 0 3px var(--color-chart-3, currentColor) / 18%",
                            }}
                        />
                        3D loading + multi-stop routing
                    </span>
                    <h1
                        className="font-semibold leading-[0.94] tracking-[-0.035em] mt-5 mb-6"
                        style={{ fontSize: "clamp(48px, 6.2vw, 88px)" }}
                    >
                        Smarter loading,
                        <br />
                        <ItalSerif>smarter</ItalSerif>{" "}
                        <span className="text-chart-3">routing.</span>
                    </h1>
                    <p className="text-lg leading-relaxed text-muted-foreground max-w-[520px] mb-8">
                        Stop loading trucks by intuition. Five proven packing
                        algorithms compete to find the best fit for every
                        shipment, while delivery routes are optimized end-to-end
                        — from warehouse to final stop.
                    </p>
                    <div className="flex gap-3 items-center flex-wrap">
                        <button className="bg-foreground text-secondary px-6 py-3.5 text-[15px] font-medium hover:bg-black transition">
                            Get a demo →
                        </button>
                        <button className="px-6 py-3.5 text-[15px] font-medium border border-border hover:bg-foreground/5 transition">
                            See it pack a truck
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-14 pt-7 border-t border-border max-w-[560px]">
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                94
                                <span className="text-base text-muted-foreground ml-0.5 font-normal">
                                    %
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Median volume utilization across benchmarked
                                runs
                            </div>
                        </div>
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                5
                                <span className="text-base text-muted-foreground ml-0.5 font-normal">
                                    algos
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Run in parallel on every shipment, side by side
                            </div>
                        </div>
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                LIFO
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Packed in reverse stop order, every time
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual */}
                <HeroVisual />
            </div>
        </section>
    );
}

function HeroVisual() {
    return (
        <div
            className="relative border border-border overflow-hidden"
            style={{
                aspectRatio: "1 / 1.05",
                background:
                    "linear-gradient(180deg, oklch(0.94 0.012 86) 0%, oklch(0.91 0.018 86) 100%)",
            }}
        >
            {/* grid bg */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "linear-gradient(oklch(0.148 0.004 228.8 / 4%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.148 0.004 228.8 / 4%) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    backgroundPosition: "-1px -1px",
                }}
            />

            {/* Truck SVG (kept inline — same as before) */}
            <svg
                viewBox="0 0 600 600"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0 w-full h-full"
            >
                <defs>
                    <linearGradient id="trailerTop" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#EFE9D9" />
                    </linearGradient>
                    <linearGradient
                        id="trailerFront"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop offset="0%" stopColor="#0B0B0C" />
                        <stop offset="100%" stopColor="#1A1A1C" />
                    </linearGradient>
                    <linearGradient id="cabSide" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1A1A1C" />
                        <stop offset="100%" stopColor="#0B0B0C" />
                    </linearGradient>
                    <linearGradient id="floor" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2A2A2E" />
                        <stop offset="100%" stopColor="#161618" />
                    </linearGradient>
                </defs>
                <ellipse
                    cx="310"
                    cy="478"
                    rx="240"
                    ry="14"
                    fill="rgba(0,0,0,0.18)"
                />
                {/* Trailer rear door */}
                <polygon
                    points="540,240 560,240 560,420 540,420"
                    fill="#C44A1F"
                />
                <line
                    x1="550"
                    y1="240"
                    x2="550"
                    y2="420"
                    stroke="#0B0B0C"
                    strokeWidth="1"
                    opacity="0.4"
                />
                <rect
                    x="546"
                    y="320"
                    width="3"
                    height="20"
                    fill="#0B0B0C"
                    opacity="0.7"
                />
                <rect
                    x="551"
                    y="320"
                    width="3"
                    height="20"
                    fill="#0B0B0C"
                    opacity="0.7"
                />
                {/* Trailer top */}
                <polygon
                    points="120,210 500,210 540,240 160,240"
                    fill="url(#trailerTop)"
                    stroke="#0B0B0C"
                    strokeWidth="1"
                    opacity="0.95"
                />
                <line
                    x1="200"
                    y1="217"
                    x2="240"
                    y2="240"
                    stroke="#0B0B0C"
                    strokeWidth="0.5"
                    opacity="0.25"
                />
                <line
                    x1="280"
                    y1="217"
                    x2="320"
                    y2="240"
                    stroke="#0B0B0C"
                    strokeWidth="0.5"
                    opacity="0.25"
                />
                <line
                    x1="360"
                    y1="217"
                    x2="400"
                    y2="240"
                    stroke="#0B0B0C"
                    strokeWidth="0.5"
                    opacity="0.25"
                />
                <line
                    x1="440"
                    y1="217"
                    x2="480"
                    y2="240"
                    stroke="#0B0B0C"
                    strokeWidth="0.5"
                    opacity="0.25"
                />
                {/* Back wall (dashed) */}
                <polygon
                    points="120,210 500,210 500,390 120,390"
                    fill="rgba(11,11,12,0.04)"
                    stroke="#0B0B0C"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity="0.35"
                />
                {/* Floor */}
                <polygon
                    points="120,390 500,390 540,420 160,420"
                    fill="url(#floor)"
                />
                {/* Boxes */}
                <g>
                    <polygon
                        points="180,310 240,310 240,390 180,390"
                        fill="#E85D2C"
                    />
                    <polygon
                        points="140,280 200,280 240,310 180,310"
                        fill="#FF7A4D"
                    />
                    <polygon
                        points="140,280 140,360 180,390 180,310"
                        fill="#C44A1F"
                    />
                </g>
                <g>
                    <polygon
                        points="240,330 300,330 300,390 240,390"
                        fill="#F4C430"
                    />
                    <polygon
                        points="200,300 260,300 300,330 240,330"
                        fill="#FFD955"
                    />
                </g>
                <g>
                    <polygon
                        points="300,310 360,310 360,390 300,390"
                        fill="#2E46E5"
                    />
                    <polygon
                        points="260,280 320,280 360,310 300,310"
                        fill="#4A60FF"
                    />
                </g>
                <g>
                    <polygon
                        points="360,330 420,330 420,390 360,390"
                        fill="#EBE2CD"
                    />
                    <polygon
                        points="320,300 380,300 420,330 360,330"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="320,300 320,360 360,390 360,330"
                        fill="#C9C0AC"
                    />
                </g>
                <g>
                    <polygon
                        points="420,335 480,335 480,390 420,390"
                        fill="#E85D2C"
                    />
                    <polygon
                        points="380,305 440,305 480,335 420,335"
                        fill="#FF7A4D"
                    />
                    <polygon
                        points="380,305 380,360 420,390 420,335"
                        fill="#C44A1F"
                    />
                </g>
                <g>
                    <polygon
                        points="245,290 290,290 290,330 245,330"
                        fill="#4CAF6A"
                    />
                    <polygon
                        points="215,265 260,265 290,290 245,290"
                        fill="#6FE08C"
                    />
                    <polygon
                        points="215,265 215,305 245,330 245,290"
                        fill="#358F50"
                    />
                </g>
                <g>
                    <polygon
                        points="365,288 410,288 410,330 365,330"
                        fill="#1A1A1C"
                    />
                    <polygon
                        points="335,263 380,263 410,288 365,288"
                        fill="#2E2E32"
                    />
                    <polygon
                        points="335,263 335,303 365,330 365,288"
                        fill="#0B0B0C"
                    />
                </g>
                {/* Trailer left wall */}
                <polygon
                    points="120,210 160,240 160,420 120,390"
                    fill="url(#trailerFront)"
                    opacity="0.92"
                />
                <line
                    x1="120"
                    y1="210"
                    x2="160"
                    y2="240"
                    stroke="#3B5BFF"
                    strokeWidth="1"
                    opacity="0.4"
                />
                {/* Wireframe outline */}
                <g fill="none" stroke="#0B0B0C" strokeWidth="1.5">
                    <polyline points="120,210 500,210 540,240 160,240 120,210" />
                    <polyline points="500,210 540,240 540,420 500,390 500,210" />
                    <polyline points="120,210 160,240 160,420 120,390 120,210" />
                    <line x1="160" y1="420" x2="540" y2="420" />
                </g>
                {/* Cab */}
                <polygon
                    points="50,265 120,265 160,295 90,295"
                    fill="#262629"
                />
                <polygon
                    points="50,265 90,295 90,420 50,390"
                    fill="url(#cabSide)"
                />
                <polygon
                    points="90,295 160,295 160,420 90,420"
                    fill="#0B0B0C"
                />
                <polygon
                    points="58,275 90,300 90,335 58,310"
                    fill="#3B5BFF"
                    opacity="0.85"
                />
                <polygon
                    points="98,305 145,305 145,340 98,340"
                    fill="#3B5BFF"
                    opacity="0.5"
                />
                <rect x="50" y="355" width="6" height="10" fill="#F4C430" />
                <rect x="48" y="378" width="8" height="14" fill="#2E2E32" />
                {/* Wheels */}
                {[
                    [76, 412, 14, 10, 4],
                    [138, 416, 14, 10, 4],
                    [380, 424, 16, 11, 4.5],
                    [430, 424, 16, 11, 4.5],
                ].map(([cx, cy, r1, r2, r3], i) => (
                    <g key={i}>
                        <circle cx={cx} cy={cy} r={r1} fill="#0B0B0C" />
                        <circle cx={cx} cy={cy} r={r2} fill="#1A1A1C" />
                        <circle cx={cx} cy={cy} r={r3} fill="#3A3A3F" />
                    </g>
                ))}
                <g
                    fontSize="10"
                    fill="#0B0B0C"
                    opacity="0.55"
                    fontWeight="600"
                    letterSpacing="2"
                >
                    <text x="60" y="200">
                        FRONT
                    </text>
                    <text x="490" y="200">
                        REAR
                    </text>
                </g>
            </svg>

            {/* Overlay 1 — top-left, dark */}
            <div
                className="absolute top-6 left-6 px-3.5 py-3 text-[11px] backdrop-blur-md border"
                style={{
                    background: "oklch(0.148 0.004 228.8 / 92%)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "#F2EBDC",
                }}
            >
                <div className="text-chart-3 uppercase tracking-[0.1em] text-[10px] mb-1">
                    Volume utilization
                </div>
                <div className="text-[18px] text-white font-medium tracking-[-0.02em]">
                    94.2%
                </div>
            </div>

            {/* Overlay 2 — bottom-right, light */}
            <div className="absolute bottom-6 right-6 px-4 py-3.5 text-[11px] bg-white/95 text-foreground border border-border min-w-[200px]">
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground/55">Items packed</span>
                    <span className="font-medium">42 / 42</span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground/55">LIFO compliant</span>
                    <span
                        className="font-medium"
                        style={{ color: "oklch(0.62 0.16 152)" }}
                    >
                        ✓ Yes
                    </span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground/55">CG check</span>
                    <span
                        className="font-medium"
                        style={{ color: "oklch(0.62 0.16 152)" }}
                    >
                        ✓ Pass
                    </span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground/55">Algorithm</span>
                    <span className="font-medium">GRASP</span>
                </div>
            </div>

            {/* Right-edge route pill */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-chart-3 text-white px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] font-medium flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="2.5" fill="white" />
                </svg>
                Route 4 stops
            </div>
        </div>
    );
}

// ============================================================
// LOGOS
// ============================================================
function Logos() {
    return (
        <div className="bg-secondary">
            <div className="max-w-[1280px] mx-auto px-8 py-10 pb-16 border-b border-border">
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground text-center mb-6">
                    Trusted by fleet operators across logistics, e-commerce, and
                    freight
                </div>
                <div className="grid grid-cols-5 gap-8 items-center opacity-70">
                    {[
                        "NorthFreight",
                        "HaulCo",
                        "MeridianLogix",
                        "CargoBank",
                        "Ridgeway",
                    ].map((n) => (
                        <div
                            key={n}
                            className="flex items-center justify-center font-semibold text-lg tracking-[-0.02em] text-foreground/70"
                        >
                            {n}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================================
// ALGORITHMS (dark band)
// ============================================================
function Algorithms() {
    const algos = [
        {
            id: "ALGO_01",
            name: "Naive Greedy",
            desc: "Fast baseline. Drops items into the first available position by descending volume — useful as a sanity check.",
            vol: "81.4%",
            w: 81,
            time: "0.04s",
        },
        {
            id: "ALGO_02",
            name: "Bottom-Left-Fill",
            desc: "Classic 2D heuristic extended to 3D. Pushes every item to the bottom-left corner before settling.",
            vol: "87.1%",
            w: 87,
            time: "0.18s",
        },
        {
            id: "ALGO_03",
            name: "Extreme Point",
            desc: "Tracks corner candidates after each placement. Better for irregular cargo mixes and tight tolerances.",
            vol: "90.6%",
            w: 91,
            time: "0.42s",
        },
        {
            id: "ALGO_04",
            name: "H1 Layer-Shelf",
            desc: "Builds horizontal layers, then shelves within layers. Strong for uniform pallet-style cargo.",
            vol: "88.9%",
            w: 89,
            time: "0.21s",
        },
        {
            id: "ALGO_05",
            name: "GRASP Metaheuristic",
            desc: "Greedy randomized adaptive search. Iterates and refines — the highest packing density on most real fleets.",
            vol: "94.2%",
            w: 94,
            time: "2.81s",
            winner: true,
        },
    ];

    return (
        <section
            id="algorithms"
            className="py-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-[1280px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-14">
                    <div>
                        <Eyebrow
                            num="01"
                            label="FIVE ALGORITHMS, ONE WINNER"
                            light
                        />
                        <h2
                            className="font-medium tracking-[-0.03em] leading-none mt-4 mb-5"
                            style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                        >
                            Pack smarter,
                            <br />
                            <ItalSerif>not</ItalSerif>{" "}
                            <span className="text-chart-3">harder.</span>
                        </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-white/70 max-w-[620px]">
                        Upload your cargo list, pick a truck, and watch five
                        different packing algorithms work in parallel. Each one
                        returns a complete 3D placement — and you choose the
                        result that fits your priorities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {algos.map((a) => (
                        <div
                            key={a.id}
                            className="p-5.5 min-h-[320px] flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5"
                            style={{
                                background: a.winner
                                    ? `linear-gradient(180deg, ${CARD_DARK} 0%, ${CARD_DARK} 60%)`
                                    : CARD_DARK,
                                border: `1px solid ${a.winner ? "rgba(232,93,44,0.5)" : LINE_DARK}`,
                                padding: "22px",
                            }}
                        >
                            {a.winner && (
                                <span
                                    className="absolute top-5.5 right-5.5 bg-chart-3 text-white text-[9px] px-1.5 py-1 tracking-[0.12em]"
                                    style={{ top: "22px", right: "22px" }}
                                >
                                    WINNER
                                </span>
                            )}
                            <div className="text-[11px] text-white/40 mb-6">
                                {a.id}
                            </div>
                            <div
                                className={`text-lg font-medium tracking-[-0.02em] mb-2 ${a.winner ? "text-chart-3" : ""}`}
                            >
                                {a.name}
                            </div>
                            <div className="text-[13px] text-white/70 leading-relaxed flex-1">
                                {a.desc}
                            </div>
                            <div
                                className="mt-5 pt-4 border-t"
                                style={{ borderColor: LINE_DARK }}
                            >
                                <div className="flex justify-between text-[11px] mb-2">
                                    <span className="text-white/50">VOL</span>
                                    <span>{a.vol}</span>
                                </div>
                                <div className="h-1 bg-white/8 overflow-hidden">
                                    <div
                                        className="h-full"
                                        style={{
                                            width: `${a.w}%`,
                                            background: a.winner
                                                ? "var(--color-chart-1)"
                                                : "var(--color-chart-3)",
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between text-[11px] mt-2.5">
                                    <span className="text-white/50">TIME</span>
                                    <span>{a.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-white/45 mt-8 tracking-[0.02em]">
                    // Benchmarks from a 500-item production fleet, mixed cargo
                    profile. Your results will vary by item mix and truck class.
                </p>
            </div>
        </section>
    );
}

// ============================================================
// 3D LOADING (dark band)
// ============================================================
function Loading3D() {
    return (
        <section
            id="loading"
            className="pb-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-[1280px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
                    <div>
                        <Eyebrow num="02" label="3D VISUALIZATION" light />
                        <h3
                            className="font-medium leading-[1.05] tracking-[-0.03em] mt-3.5 mb-4.5"
                            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
                        >
                            Every box, exactly
                            <br />
                            where it sits.
                        </h3>
                        <p className="text-[17px] leading-relaxed text-white/70 mb-6">
                            Every packing result renders as an interactive 3D
                            scene inside the truck. Rotate, zoom, and inspect
                            each item where it goes. FRONT and REAR labels make
                            orientation obvious — and the truck wireframe stays
                            out of your way.
                        </p>
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {[
                                "Per-item position, orientation, and packing sequence",
                                "This-side-up flags rendered on every box face",
                                "Driver-ready read-only view for handoff",
                                "Center-of-gravity overlay & support-ratio check",
                            ].map((line) => (
                                <li
                                    key={line}
                                    className="flex gap-3 items-start text-[15px] leading-relaxed"
                                >
                                    <Check />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div
                        className="p-6 relative overflow-hidden"
                        style={{
                            background: CARD_DARK,
                            border: `1px solid ${LINE_DARK}`,
                            aspectRatio: "1.1 / 1",
                        }}
                    >
                        <div className="flex justify-between items-center text-[11px] text-white/50 mb-4">
                            <span className="text-chart-3">
                                // truck_view.3d
                            </span>
                            <span>SH-2814 · 42 items · GRASP</span>
                        </div>
                        <div
                            className="relative w-full overflow-hidden border"
                            style={{
                                height: "calc(100% - 30px)",
                                borderColor: LINE_DARK,
                            }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&q=80"
                                alt="Cargo loaded in truck"
                                className="w-full h-full object-cover block"
                                style={{
                                    filter: "brightness(0.9) contrast(1.05)",
                                }}
                            />
                            <div
                                className="absolute top-4 left-4 px-3 py-2 text-[10px] text-white backdrop-blur-md"
                                style={{
                                    background: "rgba(0,0,0,0.75)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                }}
                            >
                                <div className="text-chart-1 mb-0.5">
                                    ITEM #018
                                </div>
                                <div>60×42×30 · stop 3 · 12.4 kg</div>
                            </div>
                            <div className="absolute top-4 right-4 px-2.5 py-1.5 text-[10px] text-white tracking-[0.1em] bg-chart-3">
                                42 / 42 PACKED
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================================
// ROUTING (dark band)
// ============================================================
function Routing() {
    return (
        <section
            id="routing"
            className="pb-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-[1280px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
                    <div
                        className="p-6 relative overflow-hidden lg:order-1 order-2"
                        style={{
                            background: CARD_DARK,
                            border: `1px solid ${LINE_DARK}`,
                            aspectRatio: "1.05 / 1",
                        }}
                    >
                        <div className="absolute top-6 left-6 flex gap-2 flex-wrap z-10">
                            {[
                                ["JOB", "DJ-441"],
                                ["STOPS", "4"],
                                ["DISTANCE", "187 km"],
                            ].map(([k, v]) => (
                                <div
                                    key={k}
                                    className="px-2.5 py-1.5 text-[10px] text-white/70"
                                    style={{
                                        background: "rgba(0,0,0,0.5)",
                                        border: `1px solid ${LINE_DARK}`,
                                    }}
                                >
                                    {k}{" "}
                                    <span className="text-white ml-1">{v}</span>
                                </div>
                            ))}
                        </div>

                        <svg
                            viewBox="0 0 500 420"
                            preserveAspectRatio="xMidYMid meet"
                            className="w-full h-full"
                        >
                            <defs>
                                <pattern
                                    id="mapGrid"
                                    x="0"
                                    y="0"
                                    width="40"
                                    height="40"
                                    patternUnits="userSpaceOnUse"
                                >
                                    <path
                                        d="M 40 0 L 0 0 0 40"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.04)"
                                        strokeWidth="1"
                                    />
                                </pattern>
                                <radialGradient
                                    id="cityGlow"
                                    cx="0.5"
                                    cy="0.5"
                                    r="0.5"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="rgba(232,93,44,0.18)"
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor="rgba(232,93,44,0)"
                                    />
                                </radialGradient>
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="500"
                                height="420"
                                fill="url(#mapGrid)"
                            />
                            <g
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="1.2"
                                fill="none"
                            >
                                <path d="M0 280 Q150 250 280 270 T500 230" />
                                <path d="M0 130 Q200 90 350 140 T500 100" />
                                <path d="M120 0 Q150 150 80 280 T160 420" />
                                <path d="M340 0 Q380 180 320 320 T380 420" />
                            </g>
                            <circle
                                cx="80"
                                cy="320"
                                r="60"
                                fill="url(#cityGlow)"
                            />
                            <circle
                                cx="190"
                                cy="200"
                                r="60"
                                fill="url(#cityGlow)"
                            />
                            <circle
                                cx="330"
                                cy="240"
                                r="60"
                                fill="url(#cityGlow)"
                            />
                            <circle
                                cx="420"
                                cy="120"
                                r="60"
                                fill="url(#cityGlow)"
                            />
                            <path
                                d="M 80 320 C 130 280, 150 230, 190 200 S 280 250, 330 240 S 400 160, 420 120"
                                fill="none"
                                stroke="#E85D2C"
                                strokeWidth="2.5"
                                strokeDasharray="6 4"
                            >
                                <animate
                                    attributeName="stroke-dashoffset"
                                    from="0"
                                    to="-20"
                                    dur="1.5s"
                                    repeatCount="indefinite"
                                />
                            </path>
                            <g transform="translate(80, 320)">
                                <rect
                                    x="-14"
                                    y="-14"
                                    width="28"
                                    height="28"
                                    fill="#0B0B0C"
                                    stroke="#3B5BFF"
                                    strokeWidth="2"
                                />
                                <rect
                                    x="-7"
                                    y="-7"
                                    width="14"
                                    height="14"
                                    fill="#3B5BFF"
                                />
                                <text
                                    x="0"
                                    y="36"
                                    textAnchor="middle"
                                    fontSize="9"
                                    fill="rgba(255,255,255,0.7)"
                                >
                                    WAREHOUSE
                                </text>
                            </g>
                            {[
                                [190, 200, "1", "Stop 01", "09:40 · 12 items"],
                                [330, 240, "2", "Stop 02", "10:55 · 8 items"],
                                [420, 120, "3", "Stop 03", "12:20 · 22 items"],
                            ].map(([x, y, n, label, time], i) => (
                                <g key={i} transform={`translate(${x}, ${y})`}>
                                    <circle r="14" fill="#E85D2C" />
                                    <text
                                        y="4"
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="600"
                                        fill="white"
                                    >
                                        {n}
                                    </text>
                                    <text
                                        x={Number(x) > 350 ? -50 : 20}
                                        y="0"
                                        textAnchor={
                                            Number(x) > 350 ? "end" : "start"
                                        }
                                        fontSize="9"
                                        fill="white"
                                    >
                                        {label}
                                    </text>
                                    <text
                                        x={Number(x) > 350 ? -50 : 20}
                                        y="12"
                                        textAnchor={
                                            Number(x) > 350 ? "end" : "start"
                                        }
                                        fontSize="9"
                                        fill="rgba(255,255,255,0.6)"
                                    >
                                        {time}
                                    </text>
                                </g>
                            ))}
                            <circle cx="0" cy="0" r="6" fill="#F4C430">
                                <animateMotion
                                    dur="6s"
                                    repeatCount="indefinite"
                                    path="M 80 320 C 130 280, 150 230, 190 200 S 280 250, 330 240 S 400 160, 420 120"
                                />
                            </circle>
                        </svg>

                        <div
                            className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-3 px-4 py-3.5"
                            style={{
                                background: HERO_DARK,
                                border: `1px solid ${LINE_DARK}`,
                            }}
                        >
                            {[
                                ["ETA total", "3h 24m"],
                                ["Distance", "187 km"],
                                ["Items", "42"],
                                ["Pack order", "3 → 2 → 1"],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <div className="text-[9px] text-white/50 uppercase tracking-[0.1em] mb-1">
                                        {k}
                                    </div>
                                    <div className="text-[15px] font-medium tracking-[-0.02em]">
                                        {v}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:order-2 order-1">
                        <Eyebrow num="03" label="MULTI-STOP ROUTING" light />
                        <h3
                            className="font-medium leading-[1.05] tracking-[-0.03em] mt-3.5 mb-4.5"
                            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
                        >
                            Routes first.
                            <br />
                            Then the cargo.
                        </h3>
                        <p className="text-[17px] leading-relaxed text-white/70 mb-6">
                            Group shipments into delivery jobs and let the
                            routing engine work out the stop order before
                            packing begins. Cargo is then loaded in reverse —
                            last in, first out by stop — so drivers don't have
                            to dig through the truck at every drop.
                        </p>
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {[
                                "Stop sequencing optimized for distance & time windows",
                                "Cargo packed in last-in, first-out unloading order",
                                "Route distance, ETA, and execution time on every job",
                            ].map((line) => (
                                <li
                                    key={line}
                                    className="flex gap-3 items-start text-[15px] leading-relaxed"
                                >
                                    <Check />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ============================================================
// VALIDATORS (cream band)
// ============================================================
function Validators() {
    const cards = [
        {
            title: "LIFO ordering",
            tag: "validateLifo",
            desc: "Checks that no later-delivery item blocks an earlier-delivery item — neither horizontally (closer to the door) nor vertically (stacked on top).",
            reports: ["lifo_ok", "lifo_violations"],
            icon: (
                <path
                    d="M3 6h14M3 10h14M3 14h14M14 4l3 2-3 2M14 12l3 2-3 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            ),
        },
        {
            title: "Support ratio",
            tag: "validateSupport",
            desc: "Every non-floor item must have at least 70% of its bottom face supported by either the truck floor or items below it.",
            reports: ["support_ok", "avg_support_ratio"],
            icon: (
                <>
                    <rect
                        x="4"
                        y="11"
                        width="12"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                    />
                    <rect
                        x="6"
                        y="5"
                        width="8"
                        height="5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                    />
                    <path
                        d="M3 18h14"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </>
            ),
        },
        {
            title: "Fragility",
            tag: "validateFragility",
            desc: "Items flagged HIGH fragility have nothing on top. Stack-weight limits and is_stackable=false rules are enforced.",
            reports: ["fragility_ok", "fragility_violations"],
            icon: (
                <path
                    d="M7 3l-2 5 5 9 5-9-2-5H7zM7 3l3 5M13 3l-3 5M5 8h10"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                />
            ),
            accent: true,
        },
        {
            title: "Center of gravity",
            tag: "validateCog",
            desc: "Computes the cargo's CG along the truck depth axis, normalized 0=cab to 1=door. Must fall within the truck's tolerance band.",
            reports: ["cog_ok", "cog_ratio"],
            icon: (
                <>
                    <circle
                        cx="10"
                        cy="10"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                    />
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                    <path
                        d="M10 3v3M10 14v3M3 10h3M14 10h3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </>
            ),
        },
    ];

    return (
        <section className="bg-secondary py-[120px]">
            <div className="max-w-[1280px] mx-auto px-8">
                <Eyebrow
                    num="04"
                    label="VALIDATORS · CHECKED AFTER PLACEMENT"
                />
                <h2
                    className="font-medium tracking-[-0.03em] leading-none mt-4 mb-5"
                    style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                >
                    Every load gets <ItalSerif>graded.</ItalSerif>
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground max-w-[700px]">
                    Once the algorithm finishes packing, four validators measure
                    the result and report compliance. The packers don't try to
                    satisfy these — the validators tell you whether they did.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-14">
                    {cards.map((c) => (
                        <div
                            key={c.title}
                            className={`p-7 min-h-[260px] flex flex-col gap-3 relative transition-all ${
                                c.accent
                                    ? "bg-foreground text-secondary border border-foreground"
                                    : "bg-secondary text-foreground border border-border hover:border-foreground/25"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div
                                    className={`grid place-items-center w-10 h-10 mb-2 ${c.accent ? "bg-chart-3 text-white" : "bg-foreground text-secondary"}`}
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        className="w-5 h-5"
                                    >
                                        {c.icon}
                                    </svg>
                                </div>
                                <span
                                    className={`text-[10px] px-2 py-1 tracking-[0.1em] ${c.accent ? "text-chart-1 bg-chart-1/12" : "text-chart-3 bg-chart-3/10"}`}
                                >
                                    {c.tag}
                                </span>
                            </div>
                            <h4 className="text-lg font-medium tracking-[-0.02em] m-0">
                                {c.title}
                            </h4>
                            <p
                                className={`text-sm leading-relaxed m-0 ${c.accent ? "text-white/70" : "text-muted-foreground"}`}
                            >
                                {c.desc}
                            </p>
                            <div
                                className={`flex gap-4 mt-3 pt-3.5 border-t ${c.accent ? "border-white/12" : "border-border"}`}
                            >
                                {c.reports.map((r, i) => (
                                    <div key={r}>
                                        {i === 0 && (
                                            <span
                                                className={`text-[10px] block ${c.accent ? "text-white/50" : "text-muted-foreground"}`}
                                            >
                                                REPORTS
                                            </span>
                                        )}
                                        {i !== 0 && (
                                            <span className="text-[10px] block opacity-0">
                                                ·
                                            </span>
                                        )}
                                        <span
                                            className={`text-xs ${c.accent ? "text-secondary" : "text-foreground"}`}
                                        >
                                            {r}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {c.accent && (
                                <span
                                    className="absolute top-7 right-7 w-2 h-2 rounded-full bg-chart-3"
                                    style={{
                                        boxShadow:
                                            "0 0 0 4px rgba(232,93,44,0.2)",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground mt-8">
                    // Validators run on every result from every algorithm.
                    Compliance flags surface in the comparison view, so you can
                    see who passed before you commit a load.
                </p>
            </div>
        </section>
    );
}

// ============================================================
// HOW IT WORKS (dark band)
// ============================================================
function HowItWorks() {
    const steps = [
        {
            n: "STEP 01",
            h: "Set up your fleet",
            p: "Add trucks with dimensions, weight limits, door side, and CG tolerances. One-time setup per vehicle.",
            vis: (
                <>
                    <rect
                        x="20"
                        y="20"
                        width="50"
                        height="25"
                        rx="0"
                        fill="none"
                        stroke="#E85D2C"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="65"
                        y="28"
                        width="14"
                        height="17"
                        rx="0"
                        fill="none"
                        stroke="#E85D2C"
                        strokeWidth="1.5"
                    />
                    <circle cx="30" cy="48" r="3" fill="#E85D2C" />
                    <circle cx="60" cy="48" r="3" fill="#E85D2C" />
                    <circle cx="73" cy="48" r="3" fill="#E85D2C" />
                </>
            ),
        },
        {
            n: "STEP 02",
            h: "Create shipments",
            p: "Drop in a cargo Excel, pick a truck, set drop points and times. Live summary as you go.",
            vis: (
                <>
                    <rect
                        x="20"
                        y="10"
                        width="40"
                        height="40"
                        fill="rgba(76,175,106,0.1)"
                        stroke="#4CAF6A"
                        strokeWidth="1.5"
                    />
                    <line x1="26" y1="20" x2="54" y2="20" stroke="#4CAF6A" />
                    <line
                        x1="26"
                        y1="28"
                        x2="54"
                        y2="28"
                        stroke="rgba(76,175,106,0.5)"
                    />
                    <line
                        x1="26"
                        y1="36"
                        x2="44"
                        y2="36"
                        stroke="rgba(76,175,106,0.5)"
                    />
                    <line
                        x1="26"
                        y1="44"
                        x2="48"
                        y2="44"
                        stroke="rgba(76,175,106,0.5)"
                    />
                    <text x="60" y="34" fontSize="14" fill="#4CAF6A">
                        →
                    </text>
                </>
            ),
        },
        {
            n: "STEP 03",
            h: "Build a delivery job",
            p: "Group shipments going out together, assign trucks. Routing runs first, sequencing the stops.",
            vis: (
                <>
                    <path
                        d="M10 45 Q35 20 60 35 T90 20"
                        fill="none"
                        stroke="#E85D2C"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                    />
                    <circle cx="10" cy="45" r="3" fill="#3B5BFF" />
                    <circle cx="35" cy="32" r="3" fill="#E85D2C" />
                    <circle cx="60" cy="35" r="3" fill="#E85D2C" />
                    <circle cx="90" cy="20" r="3" fill="#E85D2C" />
                </>
            ),
        },
        {
            n: "STEP 04",
            h: "Compare and choose",
            p: "All five algorithms run in parallel. Inspect the 3D results, check the metrics, pick the winner.",
            vis: (
                <>
                    <rect
                        x="10"
                        y="40"
                        width="12"
                        height="15"
                        fill="rgba(255,255,255,0.2)"
                    />
                    <rect
                        x="26"
                        y="32"
                        width="12"
                        height="23"
                        fill="rgba(255,255,255,0.3)"
                    />
                    <rect
                        x="42"
                        y="20"
                        width="12"
                        height="35"
                        fill="rgba(255,255,255,0.4)"
                    />
                    <rect
                        x="58"
                        y="28"
                        width="12"
                        height="27"
                        fill="rgba(255,255,255,0.3)"
                    />
                    <rect x="74" y="10" width="12" height="45" fill="#E85D2C" />
                </>
            ),
        },
        {
            n: "STEP 05",
            h: "Hand off to the driver",
            p: "Assign a driver. They acknowledge and get a read-only loading plan on their device.",
            vis: (
                <>
                    <rect
                        x="35"
                        y="8"
                        width="30"
                        height="48"
                        fill="rgba(255,255,255,0.05)"
                        stroke="#3B5BFF"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="40"
                        y="14"
                        width="20"
                        height="28"
                        fill="rgba(59,91,255,0.2)"
                    />
                    <circle cx="50" cy="49" r="2" fill="#3B5BFF" />
                    <circle cx="50" cy="28" r="3" fill="#4CAF6A" />
                </>
            ),
        },
    ];

    return (
        <section
            id="how"
            className="py-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-[1280px] mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                    <div>
                        <Eyebrow
                            num="05"
                            label="FIVE STEPS, FROM EXCEL TO DRIVER"
                            light
                        />
                        <h2
                            className="font-medium tracking-[-0.03em] leading-none mt-4"
                            style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                        >
                            How it <ItalSerif>works.</ItalSerif>
                        </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-white/70 max-w-[620px]">
                        From spreadsheet to driver handoff — the same workflow
                        your team already follows, just measured and optimized
                        at every step.
                    </p>
                </div>

                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mt-16 border-t"
                    style={{ borderColor: LINE_DARK }}
                >
                    {steps.map((s, i) => (
                        <div
                            key={s.n}
                            className={`flex flex-col gap-4 py-8 pr-6 ${i < steps.length - 1 ? "lg:border-r" : ""}`}
                            style={{ borderColor: LINE_DARK }}
                        >
                            <div className="text-[11px] text-chart-3 flex items-center gap-2">
                                <span className="w-6 h-px bg-chart-3" />
                                {s.n}
                            </div>
                            <h4 className="text-[19px] font-medium tracking-[-0.02em] leading-tight m-0">
                                {s.h}
                            </h4>
                            <p className="text-sm leading-relaxed text-white/70 m-0">
                                {s.p}
                            </p>
                            <div className="mt-auto pt-5 h-20">
                                <svg
                                    viewBox="0 0 100 60"
                                    preserveAspectRatio="xMidYMid meet"
                                    className="w-full h-full"
                                >
                                    {s.vis}
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================================
// METRICS BAND (cream)
// ============================================================
function Metrics() {
    return (
        <section className="bg-muted border-y border-border py-20">
            <div className="max-w-[1280px] mx-auto px-8">
                <div className="mb-14">
                    <Eyebrow num="06" label="DECISIONS YOU CAN DEFEND" />
                    <h2
                        className="font-medium tracking-[-0.03em] leading-none mt-4"
                        style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                    >
                        Every choice, <ItalSerif>on screen.</ItalSerif>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            lbl: "Volume utilization",
                            num: "94",
                            small: ".2%",
                            desc: "Median across the GRASP algorithm on production fleets.",
                        },
                        {
                            lbl: "Items per shipment",
                            num: "42",
                            small: " avg",
                            desc: "From small parcel runs to full pallet loads.",
                        },
                        {
                            lbl: "Avg pack time",
                            num: "2.8",
                            small: "s",
                            desc: "Five algorithms, in parallel, per shipment.",
                        },
                        {
                            lbl: "Fragility violations",
                            num: "0",
                            small: "",
                            desc: "Caught at planning, never at delivery.",
                        },
                    ].map((m) => (
                        <div key={m.lbl}>
                            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
                                {m.lbl}
                            </div>
                            <div className="text-[56px] leading-none font-medium tracking-[-0.04em]">
                                {m.num}
                                <span className="text-[22px] text-muted-foreground ml-0.5 font-normal">
                                    {m.small}
                                </span>
                            </div>
                            <div className="text-[13px] leading-relaxed text-muted-foreground mt-3 max-w-[220px]">
                                {m.desc}
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    className="mt-16 p-7 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 items-center"
                    style={{ background: HERO_DARK, color: "#F2EBDC" }}
                >
                    <div className="text-[11px] text-chart-3 uppercase tracking-[0.12em]">
                        // Built on
                    </div>
                    <div className="text-[15px] leading-relaxed">
                        Peer-reviewed operations research —
                        Martello-Pisinger-Vigo, de Castro Silva, Crainic, and
                        others. Implemented and benchmarked against standard
                        datasets. Not a black box.
                    </div>
                    <a
                        href="#"
                        className="text-sm text-chart-3 whitespace-nowrap hover:underline"
                    >
                        Read the paper trail →
                    </a>
                </div>
            </div>
        </section>
    );
}

// ============================================================
// CTA
// ============================================================
function CTA() {
    return (
        <section
            className="relative overflow-hidden pt-24 pb-20"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage:
                        "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                    WebkitMaskImage:
                        "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                }}
            />
            <div className="relative z-10 max-w-[760px] mx-auto px-8 text-center">
                <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-chart-1">
                    <span className="text-chart-1">07</span>
                    <span>— READY WHEN YOU ARE</span>
                </span>
                <h2
                    className="font-medium leading-none tracking-[-0.035em] mt-4 mb-6"
                    style={{ fontSize: "clamp(48px, 5.5vw, 76px)" }}
                >
                    Stop shipping
                    <br />
                    <ItalSerif>empty</ItalSerif>{" "}
                    <span className="text-chart-1">air.</span>
                </h2>
                <p className="text-[17px] text-white/70 mx-auto mb-9 max-w-[540px] leading-relaxed">
                    Get a 30-minute walkthrough on your own cargo data. We'll
                    run all five algorithms on a real shipment and compare the
                    results live.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <button className="bg-primary text-primary-foreground px-6 py-3.5 text-[15px] font-medium hover:brightness-110 transition">
                        Get a demo →
                    </button>
                    <button className="px-6 py-3.5 text-[15px] font-medium text-white border border-white/20 hover:bg-white/5 transition">
                        Talk to the team
                    </button>
                </div>
                <div className="mt-7 text-[11px] text-white/40 tracking-[0.08em]">
                    // NO SETUP CALL · DEMO IN 24H · CANCEL ANY TIME
                </div>
            </div>
        </section>
    );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
    const cols: [string, [string, string][]][] = [
        [
            "Product",
            [
                ["Algorithms", "#algorithms"],
                ["3D Loading", "#loading"],
                ["Route Planning", "#routing"],
                ["Driver Handoff", "#"],
            ],
        ],
        [
            "Company",
            [
                ["About", "#"],
                ["Research", "#"],
                ["Careers", "#"],
                ["Contact", "#"],
            ],
        ],
        [
            "Resources",
            [
                ["Documentation", "#"],
                ["Benchmarks", "#"],
                ["Changelog", "#"],
                ["API", "#"],
            ],
        ],
    ];

    return (
        <footer
            className="pb-9"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-[1280px] mx-auto px-8 pt-15">
                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 pb-12">
                    <div>
                        <div className="flex items-center gap-2.5 font-semibold text-[17px] tracking-[-0.02em] mb-4">
                            <div className="w-7 h-7 bg-secondary text-foreground grid place-items-center">
                                <svg
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="w-4 h-4"
                                >
                                    <rect
                                        x="1.5"
                                        y="4"
                                        width="9"
                                        height="7"
                                        rx="1"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                    />
                                    <path
                                        d="M10.5 6h2.2L14.5 8v3h-4"
                                        stroke="currentColor"
                                        strokeWidth="1.4"
                                        strokeLinejoin="round"
                                    />
                                    <circle
                                        cx="4.5"
                                        cy="12"
                                        r="1.4"
                                        fill="currentColor"
                                    />
                                    <circle
                                        cx="11.5"
                                        cy="12"
                                        r="1.4"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            OptiTruck
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed max-w-[320px]">
                            3D cargo loading and multi-stop route planning for
                            fleet operators. Built on peer-reviewed operations
                            research, benchmarked against real shipments.
                        </p>
                    </div>
                    {cols.map(([heading, items]) => (
                        <div key={heading}>
                            <h5 className="text-[11px] uppercase tracking-[0.14em] text-white/50 m-0 mb-4">
                                {heading}
                            </h5>
                            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                                {items.map(([label, href]) => (
                                    <li key={label}>
                                        <a
                                            href={href}
                                            className="text-sm opacity-80 hover:opacity-100 hover:text-chart-3 transition"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-9 flex justify-between items-center text-xs text-white/45">
                    <div>© 2026 OPTITRUCK · BUILT FOR FLEETS</div>
                    <div>v2.4.1 · GRASP-OPT</div>
                </div>
            </div>
        </footer>
    );
}

// ============================================================
// APP
// ============================================================
export default function LandingPage() {
    return (
        <div className="bg-secondary text-foreground min-h-screen">
            <Nav />
            <Hero />
            <Logos />
            <Algorithms />
            <Loading3D />
            <Routing />
            <Validators />
            <HowItWorks />
            <Metrics />
            <CTA />
            <Footer />
        </div>
    );
}
