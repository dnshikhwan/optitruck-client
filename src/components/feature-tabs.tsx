"use client";

import { useState } from "react";
import { Check, Box, Route, BarChart3, Sparkles } from "lucide-react";

type TabKey = "packing" | "routing" | "analytics";

const tabData: Record<
    TabKey,
    {
        label: string;
        subtitle: string;
        title: string;
        desc: string;
        features: string[];
    }
> = {
    packing: {
        label: "3D Bin Packing",
        subtitle: "Space Optimization",
        title: "Pack smarter, not harder.",
        desc: "Our 3D engine calculates the perfect loading order to maximize space while considering weight distribution and axle limits.",
        features: [
            "Automatic Weight Balancing",
            "Fragility & Orientation Rules",
            "Step-by-Step Visual Loading",
        ],
    },
    routing: {
        label: "Smart Routing",
        subtitle: "Dynamic Routing",
        title: "Real-time Profit Routing.",
        desc: "Don't just find the shortest path. Find the route that maximizes your fleet's throughput and minimizes fuel waste.",
        features: [
            "Dynamic Multi-Stop Solving",
            "Truck-specific Road Rules",
            "Live ETA Notifications",
        ],
    },
    analytics: {
        label: "Cost Analytics",
        subtitle: "Fleet Analytics",
        title: "Analytics you can take to the bank.",
        desc: "Track every penny saved. Automated reports show exactly how much fuel, time, and space was reclaimed by the AI.",
        features: [
            "CO2 Footprint Tracking",
            "Asset Utilization Reports",
            "Depot Performance Benchmarks",
        ],
    },
};

function PackingCard() {
    return (
        <div className="bg-card rounded-xl p-2 shadow-2xl border-4 border-border">
            <div className="bg-foreground/95 dark:bg-card px-4 py-2 flex justify-between items-center rounded-t-lg border-b border-border">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">
                        TRUCK_OPTIMIZER_v4
                    </span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                    LOADING MODE
                </span>
            </div>
            <div className="bg-gray-100 p-4 rounded-b-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground text-lg">
                        Current Utilization: 94%
                    </h3>
                    <span className="bg-brand-50 text-accent text-xs px-2 py-1 rounded font-bold">
                        142 Units
                    </span>
                </div>
                <div className="relative bg-foreground/95 dark:bg-card border border-border rounded-lg h-48 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 to-foreground/95 dark:from-card dark:to-card" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Box className="w-10 h-10 text-accent opacity-80" />
                    </div>
                    {/* Simulated 3D boxes */}
                    <div className="absolute bottom-2 left-2 w-16 h-12 bg-brand-500/30 border border-brand-500/50 rounded" />
                    <div className="absolute bottom-2 left-20 w-12 h-16 bg-blue-500/30 border border-blue-500/50 rounded" />
                    <div className="absolute bottom-2 right-8 w-20 h-10 bg-amber-500/30 border border-amber-500/50 rounded" />
                    <div className="absolute bottom-14 left-4 w-14 h-10 bg-green-500/30 border border-green-500/50 rounded" />
                </div>
                <div className="flex flex-col gap-3 mb-5">
                    <div className="flex items-start gap-3 p-2 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-foreground/80 font-medium">
                            Pallet #42 - Bottom Left Placed
                        </span>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-background border border-brand-200 dark:border-accent/30 rounded-lg shadow-sm border-l-4 border-l-accent">
                        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center text-accent text-xs mt-0.5 flex-shrink-0">
                            2
                        </div>
                        <span className="text-sm font-bold text-foreground">
                            Place Fragile Batch #09 - Top Shelf
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RoutingCard() {
    return (
        <div className="bg-card rounded-xl p-4 border border-border text-foreground">
            <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                    Active Route #882
                </span>
                <Route className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Truck A - Stop 4/12</span>
                        <span className="text-green-400">On Schedule</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-1/3 rounded-full" />
                    </div>
                </div>
                <div className="relative">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Truck B - Stop 9/15</span>
                        <span className="text-green-400">
                            Ahead of Schedule
                        </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-3/5 rounded-full" />
                    </div>
                </div>
                <div className="bg-secondary/50 p-3 rounded border border-border mt-2">
                    <div className="flex items-center gap-2 text-xs text-accent font-bold mb-1">
                        <Sparkles className="w-3 h-3" />
                        Optimization Suggestion
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Traffic delay ahead. Rerouting via Highway 4 saves 12
                        mins and 1.2 gal fuel.
                    </p>
                </div>
            </div>
        </div>
    );
}

function AnalyticsCard() {
    return (
        <div className="bg-card rounded-xl p-4 border border-border shadow-xl">
            <div className="flex items-center gap-3 border-b border-border pb-3 mb-4">
                <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center text-accent">
                    <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="font-bold text-foreground text-sm">
                        Monthly Efficiency Report
                    </h4>
                    <p className="text-xs text-muted-foreground">August 2025</p>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span className="text-muted-foreground">Fuel Savings</span>
                    <span className="text-green-500 font-bold text-xs">
                        +$12,450
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span className="text-muted-foreground">
                        Space Utilization
                    </span>
                    <span className="text-accent font-bold text-xs">98.2%</span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span className="text-muted-foreground">
                        Idle Time Reduction
                    </span>
                    <span className="text-blue-500 font-bold text-xs">
                        -18%
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm p-2 bg-secondary rounded">
                    <span className="text-muted-foreground">
                        On-time Deliveries
                    </span>
                    <span className="text-green-500 font-bold text-xs">
                        99.1%
                    </span>
                </div>
            </div>
        </div>
    );
}

const cardComponents: Record<TabKey, React.ReactNode> = {
    packing: <PackingCard />,
    routing: <RoutingCard />,
    analytics: <AnalyticsCard />,
};

export function FeatureTabs() {
    const [activeTab, setActiveTab] = useState<TabKey>("packing");
    const data = tabData[activeTab];

    return (
        <section className="py-20 bg-gray-100 border-y border-border">
            <div className="max-w-6xl mx-auto px-4">
                <h3 className="text-center text-2xl font-bold mb-10 text-foreground">
                    One platform, complete visibility:
                </h3>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {(Object.keys(tabData) as TabKey[]).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                                activeTab === key
                                    ? "bg-foreground text-background shadow-lg hover:-translate-y-1 scale-105"
                                    : "bg-card border border-border text-muted-foreground hover:text-accent hover:shadow-md"
                            }`}
                        >
                            {tabData[key].label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-card rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 p-8 md:p-12 relative overflow-hidden min-h-[550px] border border-transparent dark:border-border">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full mix-blend-multiply dark:mix-blend-screen blur-3xl opacity-50 dark:opacity-20 translate-x-1/2 -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
                        {/* Text Content */}
                        <div className="relative z-10 transition-opacity duration-300">
                            <div
                                key={activeTab}
                                className="animate-[fade-in-up_0.5s_ease-out]"
                            >
                                <h4 className="text-accent font-bold text-sm uppercase tracking-wider mb-4">
                                    {data.subtitle}
                                </h4>
                                <h3 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-6 text-pretty">
                                    {data.title}
                                </h3>
                                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                    {data.desc}
                                </p>
                                <ul className="flex flex-col gap-4">
                                    {data.features.map((f) => (
                                        <li
                                            key={f}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400 text-xs flex-shrink-0">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-foreground/80 font-medium">
                                                {f}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div
                            key={activeTab}
                            className="relative z-10 animate-[fade-in-up_0.5s_ease-out]"
                        >
                            {cardComponents[activeTab]}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
