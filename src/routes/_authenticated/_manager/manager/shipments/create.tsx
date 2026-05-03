import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "../../../../../../layouts";
import { Button } from "@/components/ui/button";
import { MousePointerClick, Plus } from "lucide-react";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { ShippingItemForm } from "@/components/shipping-item-form";
import { ButtonGroup } from "@/components/ui/button-group";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import apiFetch from "@/utils/apiFetch";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ImportExcelButton } from "@/components/ImportExcelButton";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/shipments/create",
)({
    component: CreateShipment,
    staticData: {
        breadcrumb: "Create Shipment",
    },
});

export enum FragilityLevel {
    NONE = 0,
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export enum HandlingCategory {
    STANDARD = "standard",
    FRAGILE = "fragile",
    HAZARDOUS = "hazardous",
    PERISHABLE = "perishable",
}

type ShipmentFormData = {
    name: string;
    notes?: string;
    scheduled_at: string;
    drop_point: string;
};

const itemSchema = z.object({
    name: z.string().min(1, "Item name is required"),
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
    weight_kg: z
        .number()
        .min(0.1, "Item weight is required")
        .transform((val) => val.toFixed(2)),
    quantity: z.number().min(1, "Item quantity must be at least 1"),
    color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, {
        message:
            "Invalid color format. Must be a 7-character hex code (e.g., #RRGGBB).",
    }),
    this_side_up: z.boolean(),
    allow_horizontal_rotation: z.boolean(),
    is_stackable: z.boolean(),
    fragility: z.nativeEnum(FragilityLevel),
    max_stack_weight_kg: z
        .number()
        .nullable()
        .transform((val) => (val === null ? null : val.toFixed(2))),
    priority: z.number().min(0, "Priority cannot be negative"),
    handling_category: z.nativeEnum(HandlingCategory),
});

export interface ShippingItem {
    id: string;
    name: string;
    length_cm: number;
    height_cm: number;
    width_cm: number;
    weight_kg: number;
    quantity: number;
    color_hex: string;
    this_side_up: boolean;
    allow_horizontal_rotation: boolean;
    is_stackable: boolean;
    fragility: FragilityLevel;
    max_stack_weight_kg: number | null;
    priority: number;
    handling_category: HandlingCategory;
}

interface createShipmentPayload {
    name: string;
    notes?: string;
    scheduled_at: string;
    drop_point: string;
    lat?: number;
    lng?: number;
    shipping_items: {
        name: string;
        height_cm: string;
        length_cm: string;
        width_cm: string;
        weight_kg: string;
        quantity: number;
        color_hex: string;
        this_side_up: boolean;
        allow_horizontal_rotation: boolean;
        is_stackable: boolean;
        fragility: FragilityLevel;
        max_stack_weight_kg: string | null;
        priority: number;
        handling_category: HandlingCategory;
    }[];
}

function CreateShipment() {
    const { t } = useTranslation();
    const [items, setItems] = useState<ShippingItem[]>([]);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        null,
    );
    const [isGeocoding, setIsGeocoding] = useState(false);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Moved inside component so validation messages use the active language
    const formSchema = z.object({
        name: z.string().min(1, t("shipment_name_required")),
        notes: z.string().optional().or(z.literal("")),
        scheduled_at: z
            .string()
            .min(1, t("please_schedule_date"))
            .transform((val) => new Date(val)),
        drop_point: z.string().min(1, t("drop_point_required")),
    });

    async function geocodeAddress(address: string) {
        if (!address.trim()) return;
        setIsGeocoding(true);
        try {
            const res = await fetch(
                `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&fields=items.point&key=${import.meta.env.VITE_2GIS_API_KEY}`,
            );
            const data = await res.json();
            if (data.result?.items?.length > 0) {
                const { lat, lon } = data.result.items[0].point;
                setCoords({ lat, lng: lon });
                toast.success(t("location_found"));
            } else {
                toast.error(t("address_not_found"));
                setCoords(null);
            }
        } catch {
            toast.error(t("geocoding_failed"));
            setCoords(null);
        } finally {
            setIsGeocoding(false);
        }
    }

    const createShipmentMutation = useMutation({
        mutationFn: async (payload: createShipmentPayload) => {
            const res = await apiFetch("/shipments", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: (data) => {
            toast.success(t("shipment_created"));
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            navigate({
                to: "/manager/shipments/$id",
                params: { id: data.data.shipment.id },
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm({
        defaultValues: {
            name: "",
            notes: "",
            scheduled_at: "",
            drop_point: "",
        } as ShipmentFormData,
        validators: { onSubmit: formSchema },
        onSubmit: async ({ value }) => {
            if (items.length === 0) {
                toast.error(t("add_at_least_one_item"));
                return;
            }
            const itemsResult = z
                .array(itemSchema)
                .safeParse(items.map(({ id, ...rest }) => rest));
            if (!itemsResult.success) {
                toast.error(itemsResult.error.issues[0].message);
                return;
            }
            const payload = {
                ...value,
                lat: coords?.lat,
                lng: coords?.lng,
                shipping_items: itemsResult.data,
            };
            await createShipmentMutation.mutateAsync(payload);
        },
    });

    const addShippingItem = () => {
        setItems((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: "",
                length_cm: 0,
                width_cm: 0,
                height_cm: 0,
                weight_kg: 0,
                quantity: 1,
                color_hex: "#000000",
                this_side_up: false,
                allow_horizontal_rotation: true,
                is_stackable: true,
                fragility: FragilityLevel.NONE,
                max_stack_weight_kg: null,
                priority: 0,
                handling_category: HandlingCategory.STANDARD,
            },
        ]);
    };

    function updateItem(
        id: string,
        field: keyof ShippingItem,
        value: string | number | boolean | null,
    ) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );
    }

    function removeItem(id: string) {
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    const totalWeight = items.reduce(
        (sum, i) => sum + i.weight_kg * i.quantity,
        0,
    );
    const totalVolumeCm3 = items.reduce(
        (sum, i) => sum + i.length_cm * i.width_cm * i.height_cm * i.quantity,
        0,
    );
    const totalVolumeM3 = (totalVolumeCm3 / 1_000_000).toFixed(2);

    return (
        <DashboardLayout>
            <div className="flex flex-wrap justify-between items-center gap-3">
                <h1 className="text-xl font-extrabold font-heading">
                    {t("create-shipment")}
                </h1>
                <div className="flex items-center gap-3">
                    <Button variant="outline">{t("save_draft")}</Button>
                    <Button size="sm" type="submit" form="create-shipment-form">
                        <Plus /> {t("create_shipment_button")}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <Card className="flex-1 min-w-0">
                    <CardContent>
                        <form
                            id="create-shipment-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                            className="w-full h-full flex flex-col gap-6"
                        >
                            {/* 01 — Shipment Info */}
                            <div className="w-full">
                                <FieldSet>
                                    <FieldLegend>
                                        <div className="flex h-5 items-center gap-2 text-xs tracking-widest uppercase">
                                            <span className="text-orange-500">
                                                01
                                            </span>
                                            <Separator orientation="vertical" />
                                            {t("shipment_info")}
                                        </div>
                                    </FieldLegend>
                                    <FieldGroup>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <form.Field
                                                name="name"
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
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                {t(
                                                                    "shipment_name",
                                                                )}
                                                            </FieldLabel>
                                                            <Input
                                                                id={field.name}
                                                                name={
                                                                    field.name
                                                                }
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
                                                                placeholder={t(
                                                                    "shipment_name_placeholder",
                                                                )}
                                                                autoComplete="off"
                                                            />
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-500"
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
                                            <form.Field
                                                name="drop_point"
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
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                {t(
                                                                    "drop_point",
                                                                )}
                                                            </FieldLabel>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    id={
                                                                        field.name
                                                                    }
                                                                    name={
                                                                        field.name
                                                                    }
                                                                    value={
                                                                        field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    onBlur={
                                                                        field.handleBlur
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        field.handleChange(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                        setCoords(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    aria-invalid={
                                                                        isInvalid
                                                                    }
                                                                    placeholder={t(
                                                                        "drop_point_placeholder",
                                                                    )}
                                                                    autoComplete="off"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    disabled={
                                                                        isGeocoding ||
                                                                        !field
                                                                            .state
                                                                            .value
                                                                    }
                                                                    onClick={() =>
                                                                        geocodeAddress(
                                                                            field
                                                                                .state
                                                                                .value,
                                                                        )
                                                                    }
                                                                >
                                                                    {isGeocoding
                                                                        ? t(
                                                                              "finding",
                                                                          )
                                                                        : t(
                                                                              "find",
                                                                          )}
                                                                </Button>
                                                            </div>
                                                            {coords && (
                                                                <p className="text-xs text-green-500 mt-1">
                                                                    ✓{" "}
                                                                    {coords.lat.toFixed(
                                                                        5,
                                                                    )}
                                                                    ,{" "}
                                                                    {coords.lng.toFixed(
                                                                        5,
                                                                    )}
                                                                </p>
                                                            )}
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-500"
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
                                    </FieldGroup>
                                </FieldSet>
                            </div>

                            <Separator />

                            {/* 02 — Cargo Items */}
                            <div className="w-full">
                                <FieldSet className="w-full">
                                    <FieldLegend className="w-full">
                                        <div className="flex w-full items-center justify-between flex-wrap gap-2">
                                            <div className="flex h-5 items-center gap-2 text-xs tracking-widest uppercase">
                                                <span className="text-orange-500">
                                                    02
                                                </span>
                                                <Separator orientation="vertical" />
                                                {t("cargo_items")}
                                            </div>
                                            <ButtonGroup>
                                                <ImportExcelButton
                                                    onImport={(
                                                        imported: ShippingItem[],
                                                    ) => setItems(imported)}
                                                    mapRow={(row, index) => ({
                                                        id: (
                                                            index + 1
                                                        ).toString(),
                                                        name: String(
                                                            row["name"] ?? "",
                                                        ),
                                                        length_cm: Number(
                                                            row["length_cm"] ??
                                                                0,
                                                        ),
                                                        width_cm: Number(
                                                            row["width_cm"] ??
                                                                0,
                                                        ),
                                                        height_cm: Number(
                                                            row["height_cm"] ??
                                                                0,
                                                        ),
                                                        weight_kg: Number(
                                                            row["weight_kg"] ??
                                                                0,
                                                        ),
                                                        quantity: Number(
                                                            row["quantity"] ??
                                                                1,
                                                        ),
                                                        color_hex: String(
                                                            row["color_hex"] ??
                                                                "#000000",
                                                        ),
                                                        this_side_up: Boolean(
                                                            row[
                                                                "this_side_up"
                                                            ] ?? false,
                                                        ),
                                                        allow_horizontal_rotation:
                                                            Boolean(
                                                                row[
                                                                    "allow_horizontal_rotation"
                                                                ] ?? true,
                                                            ),
                                                        is_stackable: Boolean(
                                                            row[
                                                                "is_stackable"
                                                            ] ?? true,
                                                        ),
                                                        fragility: Number(
                                                            row["fragility"] ??
                                                                0,
                                                        ) as FragilityLevel,
                                                        max_stack_weight_kg:
                                                            row[
                                                                "max_stack_weight_kg"
                                                            ]
                                                                ? Number(
                                                                      row[
                                                                          "max_stack_weight_kg"
                                                                      ],
                                                                  )
                                                                : null,
                                                        priority: Number(
                                                            row["priority"] ??
                                                                0,
                                                        ),
                                                        handling_category:
                                                            String(
                                                                row[
                                                                    "handling_category"
                                                                ] ?? "standard",
                                                            ) as HandlingCategory,
                                                    })}
                                                />
                                                <Button
                                                    onClick={() =>
                                                        addShippingItem()
                                                    }
                                                    type="button"
                                                >
                                                    <Plus /> {t("add_item")}
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    </FieldLegend>
                                    {items.length === 0 ? (
                                        <Empty
                                            className="border border-dashed bg-muted border-gray-700"
                                            onMouseOver={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    "#1a3cb8")
                                            }
                                            onMouseOut={(e) =>
                                                (e.currentTarget.style.borderColor =
                                                    "#364153")
                                            }
                                            onClick={() => addShippingItem()}
                                        >
                                            <EmptyHeader>
                                                <EmptyDescription className="flex items-center gap-2">
                                                    <MousePointerClick />{" "}
                                                    {t(
                                                        "click_to_add_first_item",
                                                    )}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    ) : (
                                        <ShippingItemForm
                                            items={items}
                                            onRemove={removeItem}
                                            onUpdate={updateItem}
                                        />
                                    )}
                                </FieldSet>
                            </div>

                            <Separator />

                            {/* 03 — Schedule & Notes */}
                            <div className="w-full">
                                <FieldSet className="w-full">
                                    <FieldLegend className="w-full">
                                        <div className="flex h-5 items-center gap-2 text-xs tracking-widest uppercase">
                                            <span className="text-orange-500">
                                                03
                                            </span>
                                            <Separator orientation="vertical" />
                                            {t("schedule_and_notes")}
                                        </div>
                                    </FieldLegend>
                                    <FieldGroup>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <form.Field
                                                name="scheduled_at"
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
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                {t(
                                                                    "scheduled_at",
                                                                )}
                                                            </FieldLabel>
                                                            <Popover>
                                                                <PopoverTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        id="scheduled_at"
                                                                        className="justify-start font-normal"
                                                                    >
                                                                        {field
                                                                            .state
                                                                            .value ? (
                                                                            format(
                                                                                new Date(
                                                                                    field
                                                                                        .state
                                                                                        .value,
                                                                                ),
                                                                                "PPP",
                                                                            )
                                                                        ) : (
                                                                            <span>
                                                                                {t(
                                                                                    "pick_a_date",
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent
                                                                    className="w-auto p-0"
                                                                    align="start"
                                                                >
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={
                                                                            field
                                                                                .state
                                                                                .value
                                                                                ? new Date(
                                                                                      field
                                                                                          .state
                                                                                          .value,
                                                                                  )
                                                                                : undefined
                                                                        }
                                                                        onSelect={(
                                                                            date,
                                                                        ) =>
                                                                            field.handleChange(
                                                                                date
                                                                                    ? date.toISOString()
                                                                                    : "",
                                                                            )
                                                                        }
                                                                        defaultMonth={
                                                                            field
                                                                                .state
                                                                                .value
                                                                                ? new Date(
                                                                                      field
                                                                                          .state
                                                                                          .value,
                                                                                  )
                                                                                : undefined
                                                                        }
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-500"
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
                                            <form.Field
                                                name="notes"
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
                                                            <FieldLabel
                                                                htmlFor={
                                                                    field.name
                                                                }
                                                            >
                                                                {t(
                                                                    "notes_optional",
                                                                )}
                                                            </FieldLabel>
                                                            <Input
                                                                id={field.name}
                                                                name={
                                                                    field.name
                                                                }
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
                                                                placeholder={t(
                                                                    "notes_placeholder",
                                                                )}
                                                                autoComplete="off"
                                                            />
                                                            {isInvalid && (
                                                                <FieldError
                                                                    className="text-red-500"
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
                                    </FieldGroup>
                                </FieldSet>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Live Summary */}
                <Card className="w-full lg:w-1/3 flex flex-col gap-5 h-fit">
                    <CardHeader>
                        <h2 className="text-xs tracking-widest uppercase font-heading">
                            {t("live_summary")}
                        </h2>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    label: t("items"),
                                    value: items.length,
                                    unit: t("boxes"),
                                },
                                {
                                    label: t("total_weight"),
                                    value: totalWeight,
                                    unit: "kg",
                                },
                                {
                                    label: t("item_volume"),
                                    value: totalVolumeM3,
                                    unit: (
                                        <span>
                                            m<sup>3</sup>
                                        </span>
                                    ),
                                },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-muted/40 border rounded-md border-gray-800 p-3"
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <p className="text-xs text-center">
                                            {stat.label}
                                        </p>
                                        <p className="text-indigo-300 font-bold text-lg">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs">{stat.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
