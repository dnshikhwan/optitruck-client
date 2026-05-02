import { Badge } from "@/components/ui/badge";
import type { ShipmentItems } from "@/interfaces/shipments";
import type { ColumnDef } from "@tanstack/react-table";

export const shipmentItemsColumns: ColumnDef<ShipmentItems>[] = [
    {
        id: "No.",
        header: "No.",
        cell: ({ row }) => {
            const no = Number(row.id) + 1;
            return <div className="text-center">{no}</div>;
        },
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const name = row.original.name;
            return <div className="text-center">{name}</div>;
        },
    },
    {
        header: "L x W x H (cm)",
        cell: ({ row }) => {
            const length = row.original.length_cm;
            const height = row.original.height_cm;
            const width = row.original.width_cm;
            return (
                <div className="text-center">
                    {length} x {width} x {height}
                </div>
            );
        },
    },
    {
        accessorKey: "weight_kg",
        header: "Weight",
        cell: ({ row }) => {
            const weight = row.original.weight_kg;
            return <div className="text-center">{weight} kg</div>;
        },
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => {
            return (
                <div className="text-center">
                    <Badge className="dark:bg-primary/40 dark:text-primary-foreground/80">
                        x {row.original.quantity}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "allow_rotation",
        header: "Allow Rotation",
        cell: ({ row }) => {
            return (
                <div className="text-center">
                    {row.original.allow_rotation ? "True" : "False"}
                </div>
            );
        },
    },
];
