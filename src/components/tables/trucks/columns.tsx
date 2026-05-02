import { type ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MapPin, MoreHorizontal, Trash, User } from "lucide-react";
import { type TFunction } from "i18next";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface Truck {
    id: string;
    model: string;
    license_plate: string;
    status: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    max_weight_kg: number;
}

export const createTruckColumns = (t: TFunction): ColumnDef<Truck>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
    },
    {
        accessorKey: "license_plate",
        header: t("license_plate"),
    },
    {
        accessorKey: "model",
        header: t("model"),
    },
    {
        accessorKey: "max_weight_kg",
        header: t("max_weight"),
        cell: ({ row }) => {
            return <div>{row.getValue("max_weight_kg")} kg</div>;
        },
    },
    {
        accessorKey: "volume",
        header: t("volume"),
        cell: ({ row }) => {
            const volume =
                row.original.length_cm *
                row.original.height_cm *
                row.original.width_cm;
            return (
                <div>
                    {(volume / 1000000).toFixed(2)} m<sup>3</sup>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            switch (status) {
                case "active":
                    return (
                        <Badge className="bg-lime-800 text-white">
                            {t("status_active")}
                        </Badge>
                    );
                case "maintenance":
                    return (
                        <Badge className="bg-amber-800 text-white">
                            {t("status_maintenance")}
                        </Badge>
                    );
                case "in_use":
                    return (
                        <Badge className="bg-blue-800 text-white">
                            {t("status_in_use")}
                        </Badge>
                    );
                case "out_of_service":
                    return (
                        <Badge className="bg-red-800 text-white">
                            {t("status_out_of_service")}
                        </Badge>
                    );
            }
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const truck = row.original;
            const onDelete = (table.options.meta as any)?.onDelete;
            const [open, setOpen] = useState(false);
            return (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Eye /> {t("view_details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit /> {t("edit_vehicle")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <User /> {t("assign_driver")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <MapPin /> {t("track_location")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DialogTrigger className="flex items-center gap-2">
                                <DropdownMenuItem className="text-destructive">
                                    <Trash className="text-destructive" />
                                    {t("remove_vehicle")}
                                </DropdownMenuItem>
                            </DialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("are_you_sure")}</DialogTitle>
                            <DialogDescription>
                                {t("action_cannot_be_undone")}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={async () => {
                                    await onDelete(truck.id);
                                    setOpen(false);
                                }}
                                className="bg-destructive text-primary-foreground hover:bg-destructive/70"
                            >
                                {t("delete")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            );
        },
    },
];
