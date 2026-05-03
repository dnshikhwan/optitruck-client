import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
    CheckLine,
    ChevronDown,
    ChevronRight,
    Cuboid,
    Download,
    Plus,
    TruckIcon,
    X,
} from "lucide-react";
import { createTruckColumns } from "@/components/tables/trucks/columns";
import { DataTable } from "@/components/tables/trucks/data-table";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "../../../../../../layouts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Truck } from "@/interfaces/trucks";
import { exportToExcel } from "@/utils/excel";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import apiFetch from "@/utils/apiFetch";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Stat,
    StatDescription,
    StatIndicator,
    StatLabel,
    StatValue,
} from "@/components/ui/stat";
// NEW: Select primitives for the door_side dropdown
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/trucks/",
)({
    component: Trucks,
    staticData: {
        breadcrumb: "Trucks",
    },
});

// NEW: DoorSide values must match the backend enum exactly.
const DOOR_SIDE_VALUES = ["rear", "left", "right"] as const;

const createTruckSchema = z
    .object({
        model: z.string().min(1, "Model is required"),
        license_plate: z.string().min(1, "License plate is required"),
        length_cm: z
            .number()
            .min(1, "Item length is required")
            .transform((val) => val.toFixed(2)),
        width_cm: z
            .number()
            .min(1, "Item width is required")
            .transform((val) => val.toFixed(2)),
        height_cm: z
            .number()
            .min(1, "Item height is required")
            .transform((val) => val.toFixed(2)),
        max_weight_kg: z
            .number()
            .min(0.1, "Item weight is required")
            .transform((val) => val.toFixed(2)),
        // NEW: door_side uses a z.enum to lock values to the three allowed strings.
        door_side: z.enum(DOOR_SIDE_VALUES),
        // NEW: CoG ratios must be between 0 and 1, and min must be less than max.
        // We validate the ordering at the schema level using superRefine at the bottom.
        cog_min_ratio: z
            .number()
            .min(0, "Must be between 0 and 1")
            .max(1, "Must be between 0 and 1")
            .transform((val) => val.toFixed(2)),
        cog_max_ratio: z
            .number()
            .min(0, "Must be between 0 and 1")
            .max(1, "Must be between 0 and 1")
            .transform((val) => val.toFixed(2)),
    })
    .superRefine((data, ctx) => {
        // NEW: cross-field validation ensures the min ratio is below the max ratio.
        // Without this, a user could set min=0.6 max=0.3 and every CoG check would fail.
        if (parseFloat(data.cog_min_ratio) >= parseFloat(data.cog_max_ratio)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["cog_max_ratio"],
                message: "Max must be greater than min",
            });
        }
    });

interface CreateTruckPayload {
    model: string;
    license_plate: string;
    length_cm: string;
    width_cm: string;
    height_cm: string;
    max_weight_kg: string;
    // NEW fields on the payload
    door_side: "rear" | "left" | "right";
    cog_min_ratio: string;
    cog_max_ratio: string;
}

function Trucks() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // NEW: controls the "Advanced" collapsible section visibility.
    const [showAdvanced, setShowAdvanced] = useState(false);

    const truckColumns = useMemo(() => createTruckColumns(t), [t]);

    const { data: trucksData = [] } = useQuery<any, Error, Truck[]>({
        queryKey: ["trucks"],
        queryFn: async () => {
            const res = await apiFetch("/trucks");
            if (!res.ok) throw new Error("Error fetching trucks");
            return res.json();
        },
        select: (response) => response.data,
    });

    const totalTruck = trucksData.length;
    const totalActiveTrucks = trucksData.reduce((total, truck) => {
        return truck.status === "active" ? total + 1 : total;
    }, 0);
    const totalInUseTrucks = trucksData.reduce((total, truck) => {
        return truck.status === "in_use" ? total + 1 : total;
    }, 0);
    const totalTrucksCapacity = trucksData.reduce((totalVolume, truck) => {
        return (
            totalVolume +
            Number(truck.height_cm) *
                Number(truck.width_cm) *
                Number(truck.length_cm)
        );
    }, 0);

    const StatisticsCardData = [
        {
            icon: <TruckIcon className="size-4" />,
            value: totalTruck.toString(),
            title: t("total_trucks"),
            description: "All trucks in fleet",
        },
        {
            icon: <CheckLine className="size-4" />,
            value: totalActiveTrucks.toString(),
            title: t("active_trucks"),
            description: "Operational trucks",
        },
        {
            icon: <X className="size-4" />,
            value: totalInUseTrucks.toString(),
            title: t("in_use"),
            description: "Trucks on duty",
        },
        {
            icon: <Cuboid className="size-4" />,
            value: (totalTrucksCapacity / 1000000).toFixed(2) + " m³",
            title: t("total_trucks_capacity"),
            description: "Total fleet volume",
        },
    ];

    const createTruckMutation = useMutation({
        mutationFn: async (payload: CreateTruckPayload) => {
            const res = await apiFetch("/trucks", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Truck created succesfully");
            queryClient.invalidateQueries({ queryKey: ["trucks"] });
            queryClient.invalidateQueries({
                queryKey: ["overview", "daily-trucks"],
            });
            setIsCreateModalOpen(false);
            // NEW: reset the advanced section when the dialog closes.
            setShowAdvanced(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const createTruckForm = useForm({
        defaultValues: {
            model: "",
            license_plate: "",
            length_cm: 0,
            width_cm: 0,
            height_cm: 0,
            max_weight_kg: 0,
            // NEW defaults. REAR is the overwhelming default for commercial trucks.
            // 0.35 / 0.65 puts the acceptable CoG zone in the middle third of the
            // cargo bay — a conservative safe range for most trucks.
            door_side: "rear" as "rear" | "left" | "right",
            cog_min_ratio: 0.35,
            cog_max_ratio: 0.65,
        },
        validators: {
            onSubmit: createTruckSchema,
        },
        onSubmit: async ({ value }) => {
            const payload: CreateTruckPayload = {
                model: value.model,
                license_plate: value.license_plate,
                length_cm: value.length_cm.toFixed(2),
                width_cm: value.width_cm.toFixed(2),
                height_cm: value.height_cm.toFixed(2),
                max_weight_kg: value.max_weight_kg.toFixed(2),
                // NEW fields sent on create
                door_side: value.door_side,
                cog_min_ratio: value.cog_min_ratio.toFixed(2),
                cog_max_ratio: value.cog_max_ratio.toFixed(2),
            };

            await createTruckMutation.mutateAsync(payload);
        },
    });

    const deleteTruckMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/trucks/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Error deleting truck");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Truck deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["trucks"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                        {t("trucks")}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => exportToExcel(trucksData, "trucks")}
                        variant={"outline"}
                    >
                        <Download />
                        {t("export")}
                    </Button>
                    <Dialog
                        open={isCreateModalOpen}
                        onOpenChange={(open) => {
                            setIsCreateModalOpen(open);
                            if (!open) {
                                createTruckForm.reset();
                                // NEW: reset advanced state when dialog closes
                                setShowAdvanced(false);
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus />
                                {t("add_truck")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("add_new_truck")}</DialogTitle>
                                <DialogDescription>
                                    {t("enter_new_details")}
                                </DialogDescription>
                            </DialogHeader>
                            <form
                                id="create-truck-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createTruckForm.handleSubmit();
                                }}
                            >
                                <div className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <createTruckForm.Field
                                            name="model"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("model")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="Standard Tilt"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <createTruckForm.Field
                                            name="license_plate"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("license_plate")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="ABC 1234"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        <createTruckForm.Field
                                            name="length_cm"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("length_cm")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value === 0
                                                                    ? ""
                                                                    : field
                                                                          .state
                                                                          .value
                                                            }
                                                            type="number"
                                                            step={"0.01"}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="0.00"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <createTruckForm.Field
                                            name="width_cm"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("width_cm")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value === 0
                                                                    ? ""
                                                                    : field
                                                                          .state
                                                                          .value
                                                            }
                                                            type="number"
                                                            step={"0.01"}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="0.00"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <createTruckForm.Field
                                            name="height_cm"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("height_cm")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value === 0
                                                                    ? ""
                                                                    : field
                                                                          .state
                                                                          .value
                                                            }
                                                            type="number"
                                                            step={"0.01"}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="0.00"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                        <createTruckForm.Field
                                            name="max_weight_kg"
                                            children={(field) => {
                                                const isInvalid =
                                                    field.state.meta
                                                        .isTouched &&
                                                    !field.state.meta.isValid;
                                                return (
                                                    <Field
                                                        data-invalid={isInvalid}
                                                    >
                                                        <FieldLabel>
                                                            {t("max_weight_kg")}
                                                        </FieldLabel>
                                                        <Input
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value === 0
                                                                    ? ""
                                                                    : field
                                                                          .state
                                                                          .value
                                                            }
                                                            type="number"
                                                            step={"0.01"}
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) =>
                                                                field.handleChange(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder="0.00"
                                                        />
                                                        {isInvalid && (
                                                            <FieldError
                                                                className="text-red-400"
                                                                errors={
                                                                    field.state
                                                                        .meta
                                                                        .errors
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                );
                                            }}
                                        />
                                    </div>

                                    {/* NEW: Advanced section toggle and content */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAdvanced((prev) => !prev)
                                        }
                                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                                    >
                                        {showAdvanced ? (
                                            <ChevronDown className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )}
                                        {t("form.advanced.toggle")}
                                    </button>

                                    {showAdvanced && (
                                        <div className="grid gap-4 pl-2 border-l-2 border-muted">
                                            <p className="text-xs text-muted-foreground">
                                                {t("form.advanced.description")}
                                            </p>

                                            <createTruckForm.Field
                                                name="door_side"
                                                children={(field) => (
                                                    <Field>
                                                        <FieldLabel>
                                                            {t(
                                                                "form.advanced.doorSide.label",
                                                            )}
                                                        </FieldLabel>
                                                        <Select
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                field.handleChange(
                                                                    v as
                                                                        | "rear"
                                                                        | "left"
                                                                        | "right",
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={t(
                                                                        "form.advanced.doorSide.placeholder",
                                                                    )}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="rear">
                                                                    {t(
                                                                        "form.advanced.doorSide.options.rear",
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="left">
                                                                    {t(
                                                                        "form.advanced.doorSide.options.left",
                                                                    )}
                                                                </SelectItem>
                                                                <SelectItem value="right">
                                                                    {t(
                                                                        "form.advanced.doorSide.options.right",
                                                                    )}
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t(
                                                                "form.advanced.doorSide.helper",
                                                            )}
                                                        </p>
                                                    </Field>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <createTruckForm.Field
                                                    name="cog_min_ratio"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta
                                                                .isTouched &&
                                                            !field.state.meta
                                                                .isValid;
                                                        return (
                                                            <Field
                                                                data-invalid={
                                                                    isInvalid
                                                                }
                                                            >
                                                                <FieldLabel>
                                                                    {t(
                                                                        "form.advanced.cog.minLabel",
                                                                    )}
                                                                </FieldLabel>
                                                                <Input
                                                                    name={
                                                                        field.name
                                                                    }
                                                                    value={
                                                                        field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="1"
                                                                    onBlur={
                                                                        field.handleBlur
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.handleChange(
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    aria-invalid={
                                                                        isInvalid
                                                                    }
                                                                    placeholder="0.35"
                                                                />
                                                                {isInvalid && (
                                                                    <FieldError
                                                                        className="text-red-400"
                                                                        errors={
                                                                            field
                                                                                .state
                                                                                .meta
                                                                                .errors
                                                                        }
                                                                    />
                                                                )}
                                                            </Field>
                                                        );
                                                    }}
                                                />

                                                <createTruckForm.Field
                                                    name="cog_max_ratio"
                                                    children={(field) => {
                                                        const isInvalid =
                                                            field.state.meta
                                                                .isTouched &&
                                                            !field.state.meta
                                                                .isValid;
                                                        return (
                                                            <Field
                                                                data-invalid={
                                                                    isInvalid
                                                                }
                                                            >
                                                                <FieldLabel>
                                                                    {t(
                                                                        "form.advanced.cog.maxLabel",
                                                                    )}
                                                                </FieldLabel>
                                                                <Input
                                                                    name={
                                                                        field.name
                                                                    }
                                                                    value={
                                                                        field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    max="1"
                                                                    onBlur={
                                                                        field.handleBlur
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        field.handleChange(
                                                                            Number(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    aria-invalid={
                                                                        isInvalid
                                                                    }
                                                                    placeholder="0.65"
                                                                />
                                                                {isInvalid && (
                                                                    <FieldError
                                                                        className="text-red-400"
                                                                        errors={
                                                                            field
                                                                                .state
                                                                                .meta
                                                                                .errors
                                                                        }
                                                                    />
                                                                )}
                                                            </Field>
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {t("form.advanced.cog.helper")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </form>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant={"outline"}>
                                        {t("cancel")}
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    type="submit"
                                    form="create-truck-form"
                                >
                                    {createTruckMutation.isPending
                                        ? "Creating"
                                        : t("add_truck")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {StatisticsCardData.map((card, index) => (
                    <Stat key={index}>
                        <StatLabel>{card.title}</StatLabel>
                        <StatValue>{card.value}</StatValue>
                        <StatIndicator variant={"icon"} color={"info"}>
                            {card.icon}
                        </StatIndicator>
                        <StatDescription>{card.description}</StatDescription>
                    </Stat>
                ))}
            </div>
            <div>
                <Card id="trucks-table">
                    <CardContent>
                        <DataTable
                            columns={truckColumns}
                            data={trucksData}
                            onDelete={(id) => deleteTruckMutation.mutate(id)}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
