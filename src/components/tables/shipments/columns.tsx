import type { Shipment } from "@/interfaces/shipments";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { type TFunction } from "i18next";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";

export const createShipmentColumns = (t: TFunction): ColumnDef<Shipment>[] => [
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
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: t("name"),
        cell: ({ row }) => {
            const name = row.original.name;
            const id = row.original.id;
            return (
                <Link to={"/manager/shipments/$id"} params={{ id }}>
                    {name}
                </Link>
            );
        },
    },
    {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
            const statusConfig = {
                draft: {
                    label: t("status_draft"),
                    className: "bg-gray-400/10 text-gray-500",
                },
                pending: {
                    label: t("status_pending"),
                    className: "bg-yellow-400/10 text-yellow-500",
                },
                optimizing: {
                    label: t("status_optimizing"),
                    className: "bg-purple-400/10 text-purple-500",
                },
                ready: {
                    label: t("status_ready"),
                    className: "bg-green-400/10 text-green-500",
                },
                assigned: {
                    label: t("status_assigned"),
                    className: "bg-blue-400/10 text-blue-500",
                },
                in_progress: {
                    label: t("status_in_progress"),
                    className: "bg-orange-400/10 text-orange-500",
                },
                delivered: {
                    label: t("status_delivered"),
                    className: "bg-emerald-400/10 text-emerald-500",
                },
                cancelled: {
                    label: t("status_cancelled"),
                    className: "bg-red-400/10 text-red-500",
                },
            };

            const config = statusConfig[row.original.status];
            if (!config) return null;

            return <Badge className={config.className}>{config.label}</Badge>;
        },
    },
    {
        accessorKey: "scheduled_at",
        header: t("scheduled_at"),
        cell: ({ row }) => {
            return (
                <div>{format(row.original.scheduled_at, "dd MMMM yyyy")}</div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: t("created_at"),
        cell: ({ row }) => {
            return <div>{format(row.original.createdAt, "dd MMM yyyy")}</div>;
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const id = row.original.id;
            const navigate = useNavigate();
            const shipment = row.original;
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
                            <DropdownMenuItem
                                onClick={() =>
                                    navigate({
                                        to: "/manager/shipments/$id",
                                        params: { id },
                                    })
                                }
                            >
                                <Eye /> {t("view_details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit /> {t("edit_shipment")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DialogTrigger className="flex items-center gap-2">
                                <DropdownMenuItem className="text-destructive">
                                    <Trash className="text-destructive" />
                                    {t("remove_shipment")}
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
                                    await onDelete(shipment.id);
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
