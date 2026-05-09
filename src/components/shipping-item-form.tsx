import { ChevronDown, ChevronRight, Dot, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { type ShippingItem } from "@/routes/_authenticated/_manager/manager/shipments/create";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Field, FieldLabel } from "./ui/field";
import { Switch } from "./ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { FragilityLevel, HandlingCategory } from "@/interfaces/create-shipment";

interface ShippingItemFormProps {
    items: ShippingItem[];
    onRemove: (id: string) => void;
    onUpdate: (
        id: string,
        field: keyof ShippingItem,
        value: string | number | boolean | null,
    ) => void;
}

export const ShippingItemForm = ({
    items,
    onRemove,
    onUpdate,
}: ShippingItemFormProps) => {
    const { t } = useTranslation();
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <>
            {items.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                return (
                    <Card key={item.id}>
                        <CardHeader>
                            <div className="flex w-full items-center justify-between">
                                <div className="flex items-center gap-1 min-w-0">
                                    <Dot className="shrink-0" />
                                    <Input
                                        className="bg-transparent! border-0 focus-visible:ring-0 min-w-0"
                                        placeholder={t("item_name_placeholder")}
                                        value={item.name}
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "name",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    type="button"
                                    onClick={() => onRemove(item.id)}
                                >
                                    <X />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-3">
                            {/* Main fields — 2 cols on mobile, 3 on sm, 6 on lg */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                <Field>
                                    <FieldLabel>{t("length_cm")}</FieldLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={
                                            item.length_cm === 0
                                                ? ""
                                                : item.length_cm
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "length_cm",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t("width_cm")}</FieldLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={
                                            item.width_cm === 0
                                                ? ""
                                                : item.width_cm
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "width_cm",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t("height_cm")}</FieldLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={
                                            item.height_cm === 0
                                                ? ""
                                                : item.height_cm
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "height_cm",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t("weight_kg")}</FieldLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={
                                            item.weight_kg === 0
                                                ? ""
                                                : item.weight_kg
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "weight_kg",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t("quantity")}</FieldLabel>
                                    <Input
                                        type="number"
                                        defaultValue={1}
                                        value={
                                            item.quantity === 0
                                                ? ""
                                                : item.quantity
                                        }
                                        onChange={(e) =>
                                            onUpdate(
                                                item.id,
                                                "quantity",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </Field>
                                <Field>
                                    <FieldLabel>{t("color")}</FieldLabel>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={item.color_hex || "#000000"}
                                            onChange={(e) =>
                                                onUpdate(
                                                    item.id,
                                                    "color_hex",
                                                    e.target.value,
                                                )
                                            }
                                            className="h-9 w-10 cursor-pointer rounded border border-input bg-transparent p-1 shrink-0"
                                        />
                                        <Input
                                            type="text"
                                            placeholder="#000000"
                                            value={item.color_hex || ""}
                                            onChange={(e) =>
                                                onUpdate(
                                                    item.id,
                                                    "color_hex",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* Advanced toggle */}
                            <button
                                type="button"
                                onClick={() => toggleExpanded(item.id)}
                                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="size-4" />
                                ) : (
                                    <ChevronRight className="size-4" />
                                )}
                                {t("advanced_handling")}
                            </button>

                            {isExpanded && (
                                <div className="flex flex-col gap-4 pl-2 border-l-2 border-muted">
                                    <p className="text-xs text-muted-foreground">
                                        {t("advanced_handling_desc")}
                                    </p>

                                    {/* Switches */}
                                    <div className="flex flex-col gap-3">
                                        <Field orientation="horizontal">
                                            <Switch
                                                checked={item.this_side_up}
                                                onCheckedChange={(e) =>
                                                    onUpdate(
                                                        item.id,
                                                        "this_side_up",
                                                        e,
                                                    )
                                                }
                                                size="sm"
                                                id={`this-side-up-${item.id}`}
                                            />
                                            <FieldLabel
                                                htmlFor={`this-side-up-${item.id}`}
                                            >
                                                {t("this_side_up")}
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {t("this_side_up_desc")}
                                            </span>
                                        </Field>

                                        <Field orientation="horizontal">
                                            <Switch
                                                checked={
                                                    item.allow_horizontal_rotation
                                                }
                                                onCheckedChange={(e) =>
                                                    onUpdate(
                                                        item.id,
                                                        "allow_horizontal_rotation",
                                                        e,
                                                    )
                                                }
                                                size="sm"
                                                id={`horiz-rot-${item.id}`}
                                            />
                                            <FieldLabel
                                                htmlFor={`horiz-rot-${item.id}`}
                                            >
                                                {t("allow_rotation")}
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {t("allow_rotation_desc")}
                                            </span>
                                        </Field>

                                        <Field orientation="horizontal">
                                            <Switch
                                                checked={item.is_stackable}
                                                onCheckedChange={(e) =>
                                                    onUpdate(
                                                        item.id,
                                                        "is_stackable",
                                                        e,
                                                    )
                                                }
                                                size="sm"
                                                id={`stackable-${item.id}`}
                                            />
                                            <FieldLabel
                                                htmlFor={`stackable-${item.id}`}
                                            >
                                                {t("stackable")}
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {t("stackable_desc")}
                                            </span>
                                        </Field>
                                    </div>

                                    {/* Advanced fields — 1 col mobile, 2 col sm+ */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>
                                                {t("fragility")}
                                            </FieldLabel>
                                            <Select
                                                value={String(item.fragility)}
                                                onValueChange={(v) =>
                                                    onUpdate(
                                                        item.id,
                                                        "fragility",
                                                        Number(v),
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.NONE,
                                                        )}
                                                    >
                                                        {t("fragility_none")}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.LOW,
                                                        )}
                                                    >
                                                        {t("fragility_low")}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.MEDIUM,
                                                        )}
                                                    >
                                                        {t("fragility_medium")}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.HIGH,
                                                        )}
                                                    >
                                                        {t("fragility_high")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                {t("handling_category")}
                                            </FieldLabel>
                                            <Select
                                                value={item.handling_category}
                                                onValueChange={(v) =>
                                                    onUpdate(
                                                        item.id,
                                                        "handling_category",
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.STANDARD
                                                        }
                                                    >
                                                        {t("handling_standard")}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.FRAGILE
                                                        }
                                                    >
                                                        {t("handling_fragile")}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.HAZARDOUS
                                                        }
                                                    >
                                                        {t(
                                                            "handling_hazardous",
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.PERISHABLE
                                                        }
                                                    >
                                                        {t(
                                                            "handling_perishable",
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                {t("max_stack_weight_kg")}
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                inputMode="decimal"
                                                placeholder={t(
                                                    "max_stack_weight_placeholder",
                                                )}
                                                value={
                                                    item.max_stack_weight_kg ??
                                                    ""
                                                }
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    onUpdate(
                                                        item.id,
                                                        "max_stack_weight_kg",
                                                        raw === ""
                                                            ? null
                                                            : Number(raw),
                                                    );
                                                }}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {t("max_stack_weight_hint")}
                                            </span>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                {t("priority")}
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="0"
                                                value={
                                                    item.priority === 0
                                                        ? ""
                                                        : item.priority
                                                }
                                                onChange={(e) =>
                                                    onUpdate(
                                                        item.id,
                                                        "priority",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {t("priority_hint")}
                                            </span>
                                        </Field>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </>
    );
};
