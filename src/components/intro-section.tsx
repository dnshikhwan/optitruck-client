export function IntroSection() {
    return (
        <section id="platform" className="py-24 bg-background relative">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h4 className="text-orange-500 font-bold text-xl mb-2">
                    The OptiTruck Advantage
                </h4>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-foreground text-balance">
                    Efficiency is no longer <br />
                    <span className="text-muted-foreground/50">
                        a guessing game.
                    </span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Traditional logistics software treats packing and routing as
                    separate problems. PackRoute AI unifies them, ensuring that
                    every truck is loaded specifically for the most efficient
                    delivery sequence possible.
                </p>
                <div className="inline-block bg-gray-100 border border-border rounded-lg p-4">
                    <p className="text-sm font-semibold text-orange-500 mb-1">
                        Save an average of $2.4k per truck, per month.
                    </p>
                    <p className="text-sm text-foreground">
                        No complex hardware required. Works with your existing
                        TMS.
                    </p>
                </div>
            </div>
        </section>
    );
}
