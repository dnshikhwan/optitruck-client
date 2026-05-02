"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    title: string;
    className?: string;
}

export default function StatisticsCard({
    icon,
    value,
    title,
    className,
}: StatCardProps) {
    const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
    const numericPart = value.match(/[\d.]+/)?.[0] ?? "";
    const decimals = numericPart.includes(".")
        ? (numericPart.split(".")[1]?.length ?? 0)
        : 0;
    const prefix = value.match(/^[^0-9.-]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9.-]*$/)?.[0] ?? "";

    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    const count = useCountUp({
        end: numericValue,
        duration: 2200,
        decimals,
        enabled: isVisible,
    });

    return (
        <Card
            ref={ref}
            className={cn(
                "gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                className,
            )}
        >
            <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary-foreground">
                    {icon}
                </div>
                <span className="text-2xl font-bold tracking-tight text-card-foreground tabular-nums">
                    {prefix}
                    {count.toLocaleString(undefined, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals,
                    })}
                    {suffix}
                </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <span className="font-semibold text-card-foreground">
                    {title}
                </span>
            </CardContent>
        </Card>
    );
}
