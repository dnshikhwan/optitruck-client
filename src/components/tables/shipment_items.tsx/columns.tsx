import { Badge } from "@/components/ui/badge";
import type { ShipmentItems } from "@/interfaces/shipments";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

export function createShipmentItemsColumns(
    t: TFunction,
): ColumnDef<ShipmentItems>[] {
    return [
        {
            id: "No.",
            header: t("itemsTable.no"),
            cell: ({ row }) => (
                <div className="text-center">{Number(row.id) + 1}</div>
            ),
        },
        {
            accessorKey: "name",
            header: t("itemsTable.name"),
            cell: ({ row }) => (
                <div className="text-center">{row.original.name}</div>
            ),
        },
        {
            header: t("itemsTable.dimensions"),
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.length_cm} × {row.original.width_cm} ×{" "}
                    {row.original.height_cm}
                </div>
            ),
        },
        {
            accessorKey: "weight_kg",
            header: t("itemsTable.weight"),
            cell: ({ row }) => (
                <div className="text-center">
                    {t("itemsTable.weightUnit", {
                        value: row.original.weight_kg,
                    })}
                </div>
            ),
        },
        {
            accessorKey: "quantity",
            header: t("itemsTable.quantity"),
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge className="dark:bg-primary/40 dark:text-primary-foreground/80">
                        x {row.original.quantity}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: "allow_rotation",
            header: t("itemsTable.allowRotation"),
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.allow_rotation
                        ? t("itemsTable.true")
                        : t("itemsTable.false")}
                </div>
            ),
        },
    ];
}
