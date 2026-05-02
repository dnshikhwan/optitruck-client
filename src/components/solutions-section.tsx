import { CheckCircle, Truck } from "lucide-react";
import routeImage from "../assets/images/route-map.jpg";
import driverTablet from "../assets/images/driver-tablet.jpg";

export function SolutionsSection() {
    return (
        <section id="solutions" className="py-24 overflow-hidden bg-background">
            <div className="max-w-6xl mx-auto px-4 flex flex-col gap-32">
                {/* Feature 1: Intelligent Routing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="text-accent font-bold text-xs uppercase tracking-wide">
                            Dynamic Routing
                        </span>
                        <h3 className="text-3xl font-display font-bold mt-2 mb-4 text-foreground">
                            Traffic-Aware Multi-Stop Optimization
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            {
                                "Our routing engine doesn't just find the shortest path; it finds the most profitable one. It accounts for delivery windows, vehicle capacity, and real-time traffic to save your drivers hours every week."
                            }
                        </p>
                        <div className="bg-foreground/95 dark:bg-card p-5 rounded-lg text-xs font-mono text-muted-foreground border border-border shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-amber-500" />
                            <p className="text-green-400 mb-1">
                                {"// Route recalculation triggered"}
                            </p>
                            <p className="mb-1">
                                <span className="text-purple-400">const</span>{" "}
                                optimalPath ={" "}
                                <span className="text-blue-400">await</span>{" "}
                                packRoute.solve(
                                {"{"}
                            </p>
                            <p className="pl-4 mb-1">stops: 42,</p>
                            <p className="pl-4 mb-1">
                                priority:{" "}
                                <span className="text-amber-300">
                                    {'"Fuel Efficiency"'}
                                </span>
                                ,
                            </p>
                            <p className="pl-4 mb-1">
                                traffic:{" "}
                                <span className="text-amber-300">
                                    {'"Real-time"'}
                                </span>
                            </p>
                            <p>{"});"}</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-brand-500 to-amber-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                        <img
                            src={routeImage}
                            alt="AI-powered route optimization map"
                            width={800}
                            height={600}
                            className="relative rounded-xl shadow-2xl w-full border border-border"
                        />
                    </div>
                </div>

                {/* Feature 2: Driver Interface */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative">
                        <img
                            src={driverTablet}
                            alt="Driver tablet interface for loading and navigation"
                            width={800}
                            height={600}
                            className="rounded-xl shadow-2xl w-full border border-border transform md:-rotate-2 hover:rotate-0 transition duration-500"
                        />
                        <div
                            className="absolute bottom-10 right-10 bg-card p-4 rounded-lg shadow-xl border border-border flex items-center gap-3 animate-bounce"
                            style={{ animationDuration: "3s" }}
                        >
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-500/15 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Truck Status
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                    Fully Optimized
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-accent font-bold text-xs uppercase tracking-wide">
                            Field-Ready Apps
                        </span>
                        <h3 className="text-3xl font-display font-bold mt-2 mb-4 text-foreground">
                            Empower Your Drivers
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                            No more complex paperwork. Drivers get a simple,
                            visual app that tells them exactly how to load the
                            truck and the fastest way to get to their next stop.
                        </p>
                        <ul className="mt-6 flex flex-col gap-3">
                            {[
                                "Easy-to-read 3D loading guides",
                                "Turn-by-turn truck-specific navigation",
                                "Instant POD (Proof of Delivery)",
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-3 text-sm text-foreground/80"
                                >
                                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
