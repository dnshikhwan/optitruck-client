import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";
import {
    Trash2Icon,
    XCircleIcon,
    AlertCircleIcon,
    ArchiveXIcon,
    BanIcon,
} from "lucide-react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const holdButtonVariants = cva("min-w-40 relative overflow-hidden touch-none", {
    variants: {
        variant: {
            destructive: [
                "bg-red-100 dark:bg-red-500",
                "hover:bg-red-200 dark:hover:bg-red-900",
                "text-red-700 dark:text-white",
                "border border-red-300 dark:border-red-800",
            ],
            primary: [
                "bg-primary/10",
                "hover:bg-primary/15",
                "text-primary-foreground",
                "border border-primary/20",
            ],
            secondary: [
                "bg-secondary/10",
                "hover:bg-secondary/15",
                "text-secondary-foreground",
                "border border-secondary/20",
            ],
            muted: [
                "bg-muted",
                "hover:bg-muted/80",
                "text-muted-foreground",
                "border border-border",
            ],
            accent: [
                "bg-accent",
                "hover:bg-accent/80",
                "text-accent-foreground",
                "border border-border",
            ],
        },
    },
    defaultVariants: {
        variant: "destructive",
    },
});

interface HoldButtonProps
    extends
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof holdButtonVariants> {
    holdDuration?: number;
}

export default function HoldButton({
    className,
    variant = "destructive",
    holdDuration = 3000,
    ...props
}: HoldButtonProps) {
    const [isHolding, setIsHolding] = useState(false);
    const controls = useAnimation();

    async function handleHoldStart() {
        setIsHolding(true);
        controls.set({ width: "0%" });
        await controls.start({
            width: "100%",
            transition: {
                duration: holdDuration / 1000,
                ease: "linear",
            },
        });
    }

    function handleHoldEnd() {
        setIsHolding(false);
        controls.stop();
        controls.start({
            width: "0%",
            transition: { duration: 0.1 },
        });
    }

    return (
        <Button
            className={cn(holdButtonVariants({ variant, className }))}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            {...props}
        >
            <motion.div
                initial={{ width: "0%" }}
                animate={controls}
                className={cn("absolute left-0 top-0 h-full", {
                    "bg-red-500/30": variant === "destructive",
                    "bg-primary/20": variant === "primary",
                    "bg-secondary/20": variant === "secondary",
                    "bg-muted-foreground/20": variant === "muted",
                    "bg-accent-foreground/20": variant === "accent",
                })}
            />
            <span className="relative z-10 w-full flex items-center justify-center gap-2">
                {(variant === "destructive" || !variant) && (
                    <Trash2Icon className="w-4 h-4" />
                )}
                {variant === "primary" && (
                    <AlertCircleIcon className="w-4 h-4" />
                )}
                {variant === "secondary" && <XCircleIcon className="w-4 h-4" />}
                {variant === "muted" && <BanIcon className="w-4 h-4" />}
                {variant === "accent" && <ArchiveXIcon className="w-4 h-4" />}
                {!isHolding ? "Delete" : "Release"}
            </span>
        </Button>
    );
}
