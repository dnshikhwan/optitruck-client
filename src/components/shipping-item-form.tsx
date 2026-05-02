import { ChevronDown, ChevronRight, Dot, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
    type ShippingItem,
    FragilityLevel,
    HandlingCategory,
} from "@/routes/_authenticated/_manager/manager/shipments/create";
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
    // Track which items have their advanced section expanded.
    // Use a Set of item IDs so toggling is O(1) and collapsing one item
    // doesn't affect others.
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
                            <div className="flex w-full items-center justify-between rounded-md">
                                <div className="flex items-center gap-1">
                                    <Dot />
                                    <Input
                                        className="max-w-2xs bg-transparent! border-0 focus-visible:ring-0"
                                        placeholder="Item name..."
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
                                    variant={"ghost"}
                                    size={"icon-sm"}
                                    type="button"
                                    onClick={() => onRemove(item.id)}
                                >
                                    <X />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {/* Existing dimension + weight + qty + color row */}
                            <div className="flex items-center gap-4">
                                <Field>
                                    <FieldLabel>Length (cm)</FieldLabel>
                                    <Input
                                        type="number"
                                        step={"0.01"}
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
                                    <FieldLabel>Width (cm)</FieldLabel>
                                    <Input
                                        type="number"
                                        step={"0.01"}
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
                                    <FieldLabel>Height (cm)</FieldLabel>
                                    <Input
                                        type="number"
                                        step={"0.01"}
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
                                    <FieldLabel>Weight (kg)</FieldLabel>
                                    <Input
                                        type="number"
                                        step={"0.01"}
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
                                    <FieldLabel>Quantity</FieldLabel>
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
                                    <FieldLabel>Color</FieldLabel>
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
                                            className="h-9 w-10 cursor-pointer rounded border border-input bg-transparent p-1"
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

                            {/* Advanced section toggle */}
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
                                Advanced: handling & constraints
                            </button>

                            {/* Advanced section content */}
                            {isExpanded && (
                                <div className="flex flex-col gap-4 pl-2 border-l-2 border-muted">
                                    <p className="text-xs text-muted-foreground">
                                        Optional. These fields control how the
                                        packing algorithm treats this item —
                                        orientation, stackability, fragility,
                                        and loading priority.
                                    </p>

                                    {/* Orientation switches */}
                                    <div className="flex flex-col gap-3">
                                        <Field orientation={"horizontal"}>
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
                                                This side up
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                Prevents the item from being
                                                tipped onto its side
                                            </span>
                                        </Field>

                                        <Field orientation={"horizontal"}>
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
                                                Allow rotation
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                Item can spin around its
                                                vertical axis (swap length and
                                                width)
                                            </span>
                                        </Field>

                                        <Field orientation={"horizontal"}>
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
                                                Stackable
                                            </FieldLabel>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                Allow other items to be placed
                                                on top
                                            </span>
                                        </Field>
                                    </div>

                                    {/* Fragility + handling category + priority + max stack weight */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>Fragility</FieldLabel>
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
                                                        None — rugged
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.LOW,
                                                        )}
                                                    >
                                                        Low — standard care
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.MEDIUM,
                                                        )}
                                                    >
                                                        Medium — limit stacking
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={String(
                                                            FragilityLevel.HIGH,
                                                        )}
                                                    >
                                                        High — do not stack
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Handling category
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
                                                        Standard
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.FRAGILE
                                                        }
                                                    >
                                                        Fragile
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.HAZARDOUS
                                                        }
                                                    >
                                                        Hazardous
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={
                                                            HandlingCategory.PERISHABLE
                                                        }
                                                    >
                                                        Perishable
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </Field>

                                        <Field>
                                            <FieldLabel>
                                                Max stacking weight (kg)
                                            </FieldLabel>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                inputMode="decimal"
                                                placeholder="Leave empty for default"
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
                                                If blank, uses 2× item's own
                                                weight
                                            </span>
                                        </Field>

                                        <Field>
                                            <FieldLabel>Priority</FieldLabel>
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
                                                Higher values load first when
                                                capacity is tight
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
