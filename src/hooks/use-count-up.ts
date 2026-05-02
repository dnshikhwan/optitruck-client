import { useEffect, useState, useCallback } from "react";

function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface UseCountUpOptions {
    end: number;
    start?: number;
    duration?: number;
    decimals?: number;
    enabled?: boolean;
}

export function useCountUp({
    end,
    start = 0,
    duration = 2000,
    decimals = 0,
    enabled = true,
}: UseCountUpOptions) {
    const [count, setCount] = useState(start);

    const animate = useCallback(() => {
        const startTime = performance.now();

        function step(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = start + (end - start) * easedProgress;

            setCount(Number(currentValue.toFixed(decimals)));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }, [start, end, duration, decimals]);

    useEffect(() => {
        if (enabled) {
            animate();
        }
    }, [enabled, animate]);

    return count;
}
