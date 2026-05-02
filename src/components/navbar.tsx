"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import { Route } from "@/routes";
import { Button } from "./ui/button";

const navLinks = [
    { href: "#platform", label: "Solution" },
    { href: "#solutions", label: "Features" },
    { href: "#journey", label: "Deployment" },
    { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { auth } = Route.useRouteContext();

    const navigate = useNavigate();

    useEffect(() => {
        const lenis = new Lenis();
        function raf(time: any) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ${
                scrolled ? "py-2 sm:py-3" : "py-4 sm:py-6"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between pointer-events-auto">
                    {/* Brand Wing */}
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 group cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(234,88,12,0.1)]">
                        <div className="relative">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-display font-bold text-xl transition-transform group-hover:rotate-15deg">
                                <Truck />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <span className="text-xl font-display font-bold text-slate-900 tracking-tight">
                            OptiTruck
                        </span>
                    </div>

                    {/* Central Floating Nav */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-900 text-white px-2 py-2 rounded-2xl shadow-2xl border border-slate-800">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-5 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-all text-slate-300 hover:text-white"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Action Wing */}
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:items-center sm:flex bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
                            {auth.isAuthenticated ? (
                                <Button
                                    onClick={() => {
                                        if (auth.hasRole("manager")) {
                                            navigate({ to: "/manager" });
                                        } else {
                                            navigate({ to: "/driver" });
                                        }
                                    }}
                                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:bg-orange-500 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                >
                                    Dashboard
                                </Button>
                            ) : (
                                <>
                                    <button
                                        onClick={() =>
                                            navigate({
                                                to: "/auth/login",
                                                search: { redirect: "/" },
                                            })
                                        }
                                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
                                    >
                                        Log in
                                    </button>
                                    <button
                                        onClick={() =>
                                            navigate({ to: "/auth/signup" })
                                        }
                                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:bg-orange-500 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                        <button
                            className="lg:hidden w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-lg border border-slate-100 text-slate-900"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle mobile menu"
                        >
                            <div className="relative w-6 h-5">
                                <span
                                    className={`absolute block w-full h-0.5 bg-current rounded-full transition-all duration-300 ${
                                        mobileOpen ? "top-2 rotate-45" : "top-0"
                                    }`}
                                />
                                <span
                                    className={`absolute block w-full h-0.5 bg-current rounded-full transition-all duration-300 top-2 ${
                                        mobileOpen ? "opacity-0" : "opacity-100"
                                    }`}
                                />
                                <span
                                    className={`absolute block h-0.5 bg-current rounded-full transition-all duration-300 right-0 ${
                                        mobileOpen
                                            ? "w-full top-2 -rotate-45"
                                            : "w-2/3 top-4"
                                    }`}
                                />
                            </div>
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="lg:hidden mt-3 pointer-events-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 animate-[fade-in-up_0.3s_ease-out]">
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-all"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                <Link
                                    to={"/auth/login"}
                                    search={{
                                        redirect: "",
                                    }}
                                    href="#"
                                    className="flex-1 text-center px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors rounded-xl"
                                >
                                    Log in
                                </Link>
                                <button className="flex-1 bg-primary text-white px-4 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:bg-orange-500 transition-all">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
