import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    label: string;
    description?: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function StepIndicator({
    steps,
    currentStep,
    className,
}: StepIndicatorProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-start">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-start",
                                !isLast && "flex-1",
                            )}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200",
                                        isCompleted &&
                                            "border-primary bg-primary text-primary-foreground",
                                        isCurrent &&
                                            "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                                        !isCompleted &&
                                            !isCurrent &&
                                            "border-muted-foreground/30 bg-background text-muted-foreground",
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check
                                            className="h-5 w-5"
                                            strokeWidth={3}
                                        />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span
                                        className={cn(
                                            "text-sm font-medium whitespace-nowrap",
                                            isCurrent || isCompleted
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                    {step.description && (
                                        <span className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">
                                            {step.description}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {!isLast && (
                                <div
                                    className={cn(
                                        "mt-5 mx-2 h-0.5 flex-1 transition-colors duration-200",
                                        isCompleted ? "bg-primary" : "bg-muted",
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
