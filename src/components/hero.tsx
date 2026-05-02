import { ArrowRight, Play, Box } from "lucide-react";
import heroDashboard from "../assets/images/hero-dashboard.jpeg";

export function Hero() {
    return (
        <section className="relative pt-40 pb-32 overflow-hidden bg-linear-to-b from-brand-50/50 ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
                {/* Three Column Hero Content */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-12 items-center mb-20">
                    {/* Left Content: Main Heading */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                            Next-Gen Logistics
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold leading-tight tracking-tight text-slate-900 text-balance">
                            Optimize Every <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-amber-500">
                                {"Inch & Mile."}
                            </span>
                        </h1>
                    </div>

                    {/* Middle Content: Video Button */}
                    <div className="text-center order-1 lg:order-2 flex flex-col items-center justify-center">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            How it works
                        </h2>
                        <button
                            className="w-24 h-24 bg-white rounded-full shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] flex items-center justify-center text-brand-600 hover:scale-110 hover:text-brand-500 transition-all duration-300 group relative z-10 border border-slate-100"
                            aria-label="Play video"
                        >
                            <Play
                                className="ml-1 w-8 h-8 group-hover:drop-shadow-lg"
                                fill="currentColor"
                            />
                            <span className="absolute inset-0 rounded-full bg-brand-100 opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
                        </button>
                        <p className="text-xs font-medium text-slate-500 mt-4">
                            Watch it in Action
                        </p>
                    </div>

                    {/* Right Content: Description + CTA */}
                    <div className="text-center lg:text-left order-3">
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            Smart 3D bin packing and intelligent routing. Cut
                            fuel costs by 22% and eliminate wasted container
                            space instantly.
                        </p>
                        <div className="flex justify-center lg:justify-start">
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-full text-base font-bold shadow-lg hover:bg-orange-500 hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300 flex items-center gap-3 group">
                                Start Free Trial
                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Dashboard Image */}
                <div className="relative w-full max-w-6xl mt-4 px-4 sm:px-0">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-liner-to-r from-brand-500/20 to-blue-500/20 rounded-4xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000" />
                        <div className="relative bg-slate-900 rounded-4xl p-2 shadow-2xl overflow-hidden border border-slate-800/50">
                            <img
                                src={heroDashboard}
                                alt="PackRoute AI Optimization Dashboard"
                                className="w-full h-auto rounded-3xl opacity-90 group-hover:opacity-100 transition duration-700 block"
                            />
                            <div className="absolute bottom-8 left-8 right-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hidden md:flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white text-xl">
                                        <Box className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">
                                            Space Utilization: 98.4%
                                        </p>
                                        <p className="text-slate-300 text-xs">
                                            AI Suggestion: Optimized loading
                                            sequence for 12 containers
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                                        REAL-TIME OPTIMIZATION
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
