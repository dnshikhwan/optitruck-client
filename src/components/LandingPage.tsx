import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import "../styles.css";
import { useAuth } from "@/auth";
import { Button } from "./ui/button";
import { ModeToggle } from "./mode-toggle";
import { useTranslation } from "react-i18next";

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
    <span className="grid place-items-center w-5 h-5 mt-0.5 shrink-0 bg-chart-3/15 text-chart-3">
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { label: t("nav.algorithms"), href: "#algorithms" },
        { label: t("nav.loading3d"), href: "#loading" },
        { label: t("nav.routing"), href: "#routing" },
        { label: t("nav.howItWorks"), href: "#how" },
        { label: t("nav.pricing"), href: "#pricing" },
    ];

    return (
        <>
            <nav className="sticky top-0 z-50 bg-secondary border-b border-border">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[68px]">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 font-semibold text-[17px] tracking-[-0.02em] shrink-0">
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

                    {/* Desktop nav links — hidden on mobile */}
                    <div className="hidden lg:flex gap-1 items-center">
                        {navLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="px-3.5 py-2 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop auth — hidden on mobile */}
                    <div className="hidden lg:flex items-center gap-2.5">
                        <ModeToggle />
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/auth/login"
                                    search={{ redirect: "" }}
                                >
                                    <span className="text-sm px-3.5 py-2 cursor-pointer">
                                        {t("nav.login")}
                                    </span>
                                </Link>
                                <Button
                                    onClick={() =>
                                        navigate({ to: "/auth/signup" })
                                    }
                                >
                                    {t("nav.signup")}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => {
                                        if (hasRole("manager")) {
                                            navigate({ to: "/manager" });
                                        } else {
                                            navigate({
                                                to: "/driver/active-assignments",
                                            });
                                        }
                                    }}
                                >
                                    {t("nav.dashboard")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => logout()}
                                >
                                    {t("nav.logout")}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile right side */}
                    <div className="flex lg:hidden items-center gap-1">
                        <ModeToggle />
                        <button
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                            onClick={() =>
                                setMenuOpen((prev: boolean) => !prev)
                            }
                            className="w-10 h-10 grid place-items-center text-foreground hover:bg-foreground/5 transition"
                        >
                            {menuOpen ? (
                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    className="w-5 h-5"
                                >
                                    <path
                                        d="M5 5l10 10M15 5L5 15"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    className="w-5 h-5"
                                >
                                    <path
                                        d="M3 5h14M3 10h14M3 15h14"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer */}
            {menuOpen && (
                <div className="lg:hidden fixed inset-x-0 top-[68px] z-40 bg-secondary border-b border-border shadow-lg">
                    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col gap-1">
                        {navLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="px-3 py-3 text-sm text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition"
                            >
                                {item.label}
                            </a>
                        ))}

                        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/auth/login"
                                        search={{ redirect: "" }}
                                        onClick={() => setMenuOpen(false)}
                                        className="block w-full text-center text-sm px-4 py-2.5 border border-border hover:bg-foreground/5 transition"
                                    >
                                        {t("nav.login")}
                                    </Link>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate({ to: "/auth/signup" });
                                        }}
                                    >
                                        {t("nav.signup")}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            if (hasRole("manager")) {
                                                navigate({ to: "/manager" });
                                            } else {
                                                navigate({
                                                    to: "/driver/active-assignments",
                                                });
                                            }
                                        }}
                                    >
                                        {t("nav.dashboard")}
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            logout();
                                        }}
                                    >
                                        {t("nav.logout")}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// ============================================================
// HERO
// ============================================================
function Hero() {
    const { t } = useTranslation();
    return (
        <section className="bg-secondary py-14 pb-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
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
                        {t("hero.badge")}
                    </span>
                    <h1
                        className="font-semibold leading-[0.94] tracking-[-0.035em] mt-5 mb-6"
                        style={{ fontSize: "clamp(48px, 6.2vw, 88px)" }}
                    >
                        {t("hero.heading1")}
                        <br />
                        <ItalSerif>smarter</ItalSerif>{" "}
                        <span className="text-chart-3">
                            {t("hero.headingColored")}
                        </span>
                    </h1>
                    <p className="text-lg leading-relaxed text-muted-foreground max-w-[520px] mb-8">
                        {t("hero.description")}
                    </p>
                    <div className="flex gap-3 items-center flex-wrap">
                        <Button className="bg-black px-12 py-6" size={"lg"}>
                            {t("hero.cta")}
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mt-14 pt-7 border-t border-border max-w-[560px]">
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                {t("hero.stats.utilizationValue")}
                                <span className="text-base text-muted-foreground ml-0.5 font-normal">
                                    %
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {t("hero.stats.utilizationDesc")}
                            </div>
                        </div>
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                {t("hero.stats.algorithmsValue")}
                                <span className="text-base text-muted-foreground ml-0.5 font-normal">
                                    {t("hero.stats.algorithmsSuffix")}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {t("hero.stats.algorithmsDesc")}
                            </div>
                        </div>
                        <div>
                            <div className="text-[32px] font-medium tracking-[-0.03em] leading-none">
                                {t("hero.stats.lifoValue")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                {t("hero.stats.lifoDesc")}
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
    const { t } = useTranslation();
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
                <div className="text-chart-3 uppercase tracking-widesttext-[10px] mb-1">
                    {t("hero.visual.volumeUtilization")}
                </div>
                <div className="text-[18px] text-white font-medium tracking-[-0.02em]">
                    94.2%
                </div>
            </div>

            {/* Overlay 2 — bottom-right, light */}
            <div className="absolute bottom-6 right-6 px-4 py-3.5 text-[11px] bg-white/95 text-foreground border border-border min-w-[200px]">
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground dark:text-background/70">
                        {t("hero.visual.itemsPacked")}
                    </span>
                    <span className="font-medium dark:text-background/70">
                        42 / 42
                    </span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground dark:text-background/70">
                        {t("hero.visual.lifoCompliant")}
                    </span>
                    <span
                        className="font-medium"
                        style={{ color: "oklch(0.62 0.16 152)" }}
                    >
                        ✓ Yes
                    </span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground  dark:text-background/70">
                        {t("hero.visual.cgCheck")}
                    </span>
                    <span
                        className="font-medium"
                        style={{ color: "oklch(0.62 0.16 152)" }}
                    >
                        ✓ Pass
                    </span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                    <span className="text-foreground dark:text-background/70">
                        {t("hero.visual.algorithm")}
                    </span>
                    <span className="font-medium dark:text-background/70">
                        GRASP/VND
                    </span>
                </div>
            </div>

            {/* Right-edge route pill */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-chart-3 text-white px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] font-medium flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="2.5" fill="white" />
                </svg>
                {t("hero.visual.routePill")}
            </div>
        </div>
    );
}

// ============================================================
// LOGOS
// ============================================================
function Logos() {
    const { t } = useTranslation();
    return (
        <div className="bg-secondary">
            <div className="max-w-7xl mx-auto px-8 py-10 pb-16 border-b border-border">
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground text-center mb-6">
                    {t("logos.tagline")}
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
    const { t } = useTranslation();
    const algos = t("algorithms_landing.items", { returnObjects: true }) as {
        id: string;
        name: string;
        desc: string;
        vol: string;
        w: number;
        time: string;
        winner?: boolean;
    }[];

    return (
        <section
            id="algorithms"
            className="py-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-14">
                    <div>
                        <Eyebrow
                            num="01"
                            label={t("algorithms_landing.eyebrow")}
                            light
                        />
                        <h2
                            className="font-medium tracking-[-0.03em] leading-none mt-4 mb-5"
                            style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                        >
                            {t("algorithms_landing.heading1")}
                            <br />
                            <ItalSerif>
                                {t("algorithms_landing.headingItalic")}
                            </ItalSerif>{" "}
                            <span className="text-chart-3">
                                {t("algorithms_landing.headingColored")}
                            </span>
                        </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-white/70 max-w-[620px]">
                        {t("algorithms_landing.description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {algos.map((a) => (
                        <div
                            key={a.id}
                            className="flex flex-col relative overflow-hidden transition-all hover:-translate-y-0.5"
                            style={{
                                background: CARD_DARK,
                                border: `1px solid ${a.winner ? "rgba(232,93,44,0.5)" : LINE_DARK}`,
                                padding: "22px",
                                minHeight: "320px",
                            }}
                        >
                            {a.winner && (
                                <span
                                    className="absolute bg-chart-3 text-white text-[9px] px-1.5 py-1 tracking-[0.12em]"
                                    style={{ top: "22px", right: "22px" }}
                                >
                                    {t("algorithms_landing.winner")}
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
                                    <span className="text-white/50">
                                        {t("algorithms_landing.volLabel")}
                                    </span>
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
                                    <span className="text-white/50">
                                        {t("algorithms_landing.timeLabel")}
                                    </span>
                                    <span>{a.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-white/45 mt-8 tracking-[0.02em]">
                    {t("algorithms_landing.benchmark")}
                </p>
            </div>
        </section>
    );
}

// ============================================================
// 3D LOADING (dark band)
// ============================================================
function Loading3D() {
    const { t } = useTranslation();
    const features = t("loading3d.features", {
        returnObjects: true,
    }) as string[];
    return (
        <section
            id="loading"
            className="pb-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
                    <div>
                        <Eyebrow
                            num="02"
                            label={t("loading3d.eyebrow")}
                            light
                        />
                        <h3
                            className="font-medium leading-[1.05] tracking-[-0.03em] mt-3.5 mb-4.5"
                            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
                        >
                            {t("loading3d.heading1")}
                            <br />
                            {t("loading3d.heading2")}
                        </h3>
                        <p className="text-[17px] leading-relaxed text-white/70 mb-6">
                            {t("loading3d.description")}
                        </p>
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {features.map((line) => (
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
                                {t("loading3d.overlay.filename")}
                            </span>
                            <span>{t("loading3d.overlay.meta")}</span>
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
                                    {t("loading3d.overlay.itemLabel")}
                                </div>
                                <div>{t("loading3d.overlay.itemMeta")}</div>
                            </div>
                            <div className="absolute top-4 right-4 px-2.5 py-1.5 text-[10px] text-white tracking-widest bg-chart-3">
                                {t("loading3d.overlay.packed")}
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
    const { t } = useTranslation();
    const features = t("routing.features", { returnObjects: true }) as string[];
    const stats = t("routing.stats", { returnObjects: true }) as {
        key: string;
        value: string;
    }[];
    const stops = t("routing.map.stops", { returnObjects: true }) as {
        label: string;
        time: string;
    }[];

    const stopCoords = [
        [190, 200],
        [330, 240],
        [420, 120],
    ];
    return (
        <section
            id="routing"
            className="pb-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-7xl mx-auto px-8">
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
                                [t("routing.map.jobKey"), "DJ-441"],
                                [t("routing.map.stopsKey"), "4"],
                                [t("routing.map.distanceKey"), "187 km"],
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
                                    {t("routing.map.warehouse")}
                                </text>
                            </g>
                            {stops.map((stop, i) => {
                                const [x, y] = stopCoords[i];
                                return (
                                    <g
                                        key={i}
                                        transform={`translate(${x}, ${y})`}
                                    >
                                        <circle r="14" fill="#E85D2C" />
                                        <text
                                            y="4"
                                            textAnchor="middle"
                                            fontSize="11"
                                            fontWeight="600"
                                            fill="white"
                                        >
                                            {i + 1}
                                        </text>
                                        <text
                                            x={x > 350 ? -50 : 20}
                                            y="0"
                                            textAnchor={
                                                x > 350 ? "end" : "start"
                                            }
                                            fontSize="9"
                                            fill="white"
                                        >
                                            {stop.label}
                                        </text>
                                        <text
                                            x={x > 350 ? -50 : 20}
                                            y="12"
                                            textAnchor={
                                                x > 350 ? "end" : "start"
                                            }
                                            fontSize="9"
                                            fill="rgba(255,255,255,0.6)"
                                        >
                                            {stop.time}
                                        </text>
                                    </g>
                                );
                            })}
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
                            {stats.map(({ key, value }) => (
                                <div key={key}>
                                    <div className="text-[9px] text-white/50 uppercase tracking-widest mb-1">
                                        {key}
                                    </div>
                                    <div className="text-[15px] font-medium tracking-[-0.02em]">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:order-2 order-1">
                        <Eyebrow num="03" label={t("routing.eyebrow")} light />
                        <h3
                            className="font-medium leading-[1.05] tracking-[-0.03em] mt-3.5 mb-4.5"
                            style={{ fontSize: "clamp(32px, 3.5vw, 48px)" }}
                        >
                            {t("routing.heading1")}
                            <br />
                            {t("routing.heading2")}
                        </h3>
                        <p className="text-[17px] leading-relaxed text-white/70 mb-6">
                            {t("routing.description")}
                        </p>
                        <ul className="flex flex-col gap-3 list-none p-0 m-0">
                            {features.map((line) => (
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
    const { t } = useTranslation();
    // Icons are pure SVG paths — they don't contain text so they stay inline
    const icons = [
        <path
            key="lifo"
            d="M3 6h14M3 10h14M3 14h14M14 4l3 2-3 2M14 12l3 2-3 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />,
        <>
            <rect
                key="s1"
                x="4"
                y="11"
                width="12"
                height="5"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                key="s2"
                x="6"
                y="5"
                width="8"
                height="5"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                key="s3"
                d="M3 18h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </>,
        <path
            key="frag"
            d="M7 3l-2 5 5 9 5-9-2-5H7zM7 3l3 5M13 3l-3 5M5 8h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />,
        <>
            <circle
                key="c1"
                cx="10"
                cy="10"
                r="7"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <circle key="c2" cx="10" cy="10" r="2" fill="currentColor" />
            <path
                key="c3"
                d="M10 3v3M10 14v3M3 10h3M14 10h3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </>,
    ];

    const cards = (
        t("validators.items", { returnObjects: true }) as {
            title: string;
            tag: string;
            desc: string;
            reports: string[];
            accent?: boolean;
        }[]
    ).map((card, i) => ({ ...card, icon: icons[i] }));

    return (
        <section className="bg-secondary py-[120px]">
            <div className="max-w-7xl mx-auto px-8">
                <Eyebrow num="04" label={t("validators.eyebrow")} />
                <h2
                    className="font-medium tracking-[-0.03em] leading-none mt-4 mb-5"
                    style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                >
                    {t("validators.heading1")}{" "}
                    <ItalSerif>{t("validators.headingItalic")}</ItalSerif>
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground max-w-[700px]">
                    {t("validators.description")}
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
                                    className={`text-[10px] px-2 py-1 tracking-widest ${c.accent ? "text-chart-1 bg-chart-1/12" : "text-chart-3 bg-chart-3/10"}`}
                                >
                                    {c.tag}
                                </span>
                            </div>
                            <h4 className="text-lg font-medium tracking-[-0.02em] m-0">
                                {c.title}
                            </h4>
                            <p
                                className={`text-sm leading-relaxed m-0 ${c.accent ? "text-white/70 dark:text-background" : "text-muted-foreground"}`}
                            >
                                {c.desc}
                            </p>
                            <div
                                className={`flex gap-4 mt-3 pt-3.5 border-t ${c.accent ? "border-white/12 dark:border-background/30" : "border-border"}`}
                            >
                                {c.reports.map((r, i) => (
                                    <div key={r}>
                                        {i === 0 && (
                                            <span
                                                className={`text-[10px] block ${c.accent ? "text-white/50 dark:text-background" : "text-muted-foreground"}`}
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
                    {t("validators.footerNote")}
                </p>
            </div>
        </section>
    );
}

// ============================================================
// HOW IT WORKS (dark band)
// ============================================================
function HowItWorks() {
    const { t } = useTranslation();
    const steps = t("howItWorks.steps", { returnObjects: true }) as {
        n: string;
        h: string;
        p: string;
    }[];

    const visuals = [
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
        </>,
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
        </>,
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
        </>,
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
        </>,
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
        </>,
    ];

    return (
        <section
            id="how"
            className="py-[120px]"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
                    <div>
                        <Eyebrow
                            num="05"
                            label={t("howItWorks.eyebrow")}
                            light
                        />
                        <h2
                            className="font-medium tracking-[-0.03em] leading-none mt-4"
                            style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                        >
                            {t("howItWorks.heading1")}{" "}
                            <ItalSerif>
                                {t("howItWorks.headingItalic")}
                            </ItalSerif>
                        </h2>
                    </div>
                    <p className="text-lg leading-relaxed text-white/70 max-w-[620px]">
                        {t("howItWorks.description")}
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
                                    {visuals[i]}
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
    const { t } = useTranslation();
    const items = t("metrics.items", { returnObjects: true }) as {
        label: string;
        num: string;
        small: string;
        desc: string;
    }[];
    return (
        <section className="bg-muted border-y border-border py-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="mb-14">
                    <Eyebrow num="06" label={t("metrics.eyebrow")} />
                    <h2
                        className="font-medium tracking-[-0.03em] leading-none mt-4"
                        style={{ fontSize: "clamp(40px, 4.5vw, 64px)" }}
                    >
                        {t("metrics.heading1")}{" "}
                        <ItalSerif>{t("metrics.headingItalic")}</ItalSerif>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((m) => (
                        <div key={m.label}>
                            <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-3">
                                {m.label}
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
                        {t("metrics.builtOnLabel")}
                    </div>
                    <div className="text-[15px] leading-relaxed">
                        {t("metrics.builtOnText")}
                    </div>
                    <a
                        href="#"
                        className="text-sm text-chart-3 whitespace-nowrap hover:underline"
                    >
                        {t("metrics.builtOnLink")}
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
    const { t } = useTranslation();
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
                    <span className="text-chart-1">{t("cta.eyebrowNum")}</span>
                    <span>— {t("cta.eyebrow")}</span>
                </span>
                <h2
                    className="font-medium leading-none tracking-[-0.035em] mt-4 mb-6"
                    style={{ fontSize: "clamp(48px, 5.5vw, 76px)" }}
                >
                    {t("cta.heading1")}
                    <br />
                    <ItalSerif>{t("cta.headingItalic")}</ItalSerif>{" "}
                    <span className="text-chart-1">
                        {t("cta.headingColored")}
                    </span>
                </h2>
                <p className="text-[17px] text-white/70 mx-auto mb-9 max-w-[540px] leading-relaxed">
                    {t("cta.description")}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <button className="bg-primary text-primary-foreground px-6 py-3.5 text-[15px] font-medium hover:brightness-110 transition">
                        {t("cta.primaryButton")}
                    </button>
                    <button className="px-6 py-3.5 text-[15px] font-medium text-white border border-white/20 hover:bg-white/5 transition">
                        {t("cta.secondaryButton")}
                    </button>
                </div>
                <div className="mt-7 text-[11px] text-white/40 tracking-[0.08em]">
                    {t("cta.disclaimer")}
                </div>
            </div>
        </section>
    );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
    const { t } = useTranslation();
    const columns = t("footer.columns", { returnObjects: true }) as {
        heading: string;
        items: { label: string; href: string }[];
    }[];

    return (
        <footer
            className="pb-9"
            style={{ background: HERO_DARK, color: "#F2EBDC" }}
        >
            <div className="max-w-7xl mx-auto px-8 pt-15">
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
                            {t("footer.description")}
                        </p>
                    </div>
                    {columns.map((col) => (
                        <div key={col.heading}>
                            <h5 className="text-[11px] uppercase tracking-[0.14em] text-white/50 m-0 mb-4">
                                {col.heading}
                            </h5>
                            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                                {col.items.map(({ label, href }) => (
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
                    <div>{t("footer.copyright")}</div>
                    <div>{t("footer.version")}</div>
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
