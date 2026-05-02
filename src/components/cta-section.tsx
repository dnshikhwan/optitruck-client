import { ArrowRight, CheckCircle } from "lucide-react";

export function CtaSection() {
    return (
        <section className="py-24 relative overflow-hidden bg-foreground dark:bg-card">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl mix-blend-screen opacity-30 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] -translate-x-1/2 translate-y-1/2" />
            </div>

            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "50px 50px",
                }}
            />

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-background dark:text-foreground mb-6 leading-tight text-balance">
                    Ready to stop shipping <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-amber-400">
                        empty air?
                    </span>
                </h2>
                <p className="text-lg text-background/60 dark:text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join 500+ logistics companies using PackRoute AI to maximize
                    their capacity and minimize their carbon footprint.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-accent/25 hover:brightness-110 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group">
                        Start Building Free
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button className="w-full sm:w-auto bg-transparent border border-background/20 dark:border-border text-background dark:text-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-background/10 dark:hover:bg-secondary transition-all duration-300">
                        Book a Demo
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-background/10 dark:border-border flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-background/50 dark:text-muted-foreground font-medium opacity-80">
                    <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        API Ready
                    </span>
                    <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        No Hardware Required
                    </span>
                    <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent" />
                        SOC2 Certified
                    </span>
                </div>
            </div>
        </section>
    );
}
