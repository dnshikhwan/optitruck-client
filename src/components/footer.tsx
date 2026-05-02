"use client";

import { useState } from "react";

const footerLinks = {
    Solution: ["3D Bin Packing", "Route Optimization", "API Integration"],
    Company: ["About", "Case Studies", "Contact"],
};

export function Footer() {
    const [email, setEmail] = useState("");

    return (
        <footer className="bg-foreground dark:bg-card text-background dark:text-foreground py-16 border-t border-border">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-accent rounded flex items-center justify-center font-bold text-xs text-accent-foreground">
                            P
                        </div>
                        <span className="text-xl font-display font-bold">
                            PackRoute AI
                        </span>
                    </div>
                    <p className="text-background/60 dark:text-muted-foreground text-sm leading-relaxed">
                        The logistics operating system for modern distribution.
                        Optimized in the cloud, delivered on the road.
                    </p>
                </div>

                {Object.entries(footerLinks).map(([category, links]) => (
                    <div key={category}>
                        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-background/70 dark:text-foreground/70">
                            {category}
                        </h4>
                        <ul className="flex flex-col gap-2 text-sm text-background/50 dark:text-muted-foreground">
                            {links.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="hover:text-background dark:hover:text-foreground transition"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-background/70 dark:text-foreground/70">
                        Newsletter
                    </h4>
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setEmail("");
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background/10 dark:bg-secondary border-none text-sm px-4 py-2 rounded focus:ring-1 focus:ring-accent w-full text-background dark:text-foreground placeholder:text-background/40 dark:placeholder:text-muted-foreground outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-accent px-4 py-2 rounded font-bold hover:brightness-110 transition text-accent-foreground"
                        >
                            Go
                        </button>
                    </form>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-background/10 dark:border-border text-center text-background/40 dark:text-muted-foreground text-xs">
                {"© 2025 PackRoute AI Systems. All rights reserved."}
            </div>
        </footer>
    );
}
