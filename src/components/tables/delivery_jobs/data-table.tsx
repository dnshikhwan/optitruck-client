import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import type { DeliveryJob } from "@/interfaces/deliveryJob";
import type { Shipment } from "@/interfaces/shipments";
import type { Truck } from "@/interfaces/trucks";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { type TFunction } from "i18next";
import { format } from "date-fns";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const createDeliveryJobColumns = (
    t: TFunction,
): ColumnDef<DeliveryJob>[] => [
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
        accessorKey: "id",
        header: t("job_id"),
        cell: ({ row }) => {
            const navigate = useNavigate();
            const id = row.original.id;
            const createdAt = row.original.createdAt;
            return (
                <div
                    className="hover:cursor-pointer"
                    onClick={() =>
                        navigate({
                            to: "/manager/delivery-jobs/$id",
                            params: { id },
                        })
                    }
                >
                    DJ-{format(createdAt, "yyyy")}-
                    {id.substring(0, 6).toUpperCase()}
                </div>
            );
        },
    },
    {
        accessorKey: "truck",
        header: t("trucks"),
        cell: ({ row }) => {
            const truck: Truck = row.original.truck;
            return <div>{truck.model}</div>;
        },
    },
    {
        accessorKey: "shipments",
        header: t("shipments"),
        cell: ({ row }) => {
            const shipments: Shipment[] = row.original.shipments;
            return (
                <div>
                    {shipments.length} {t("shipments")}
                </div>
            );
        },
    },
    {
        id: "scheduled_at",
        header: t("scheduled_at"),
        cell: ({ row }) => {
            const shipments: Shipment[] = row.original.shipments;
            const firstShipment = shipments?.[0];
            if (!firstShipment?.scheduled_at) {
                return <div className="text-muted-foreground">—</div>;
            }
            return (
                <div>{format(firstShipment.scheduled_at, "dd MMMM yyyy")}</div>
            );
        },
    },
    {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
            const statusConfig: Record<
                string,
                { label: string; className: string; spinner?: boolean }
            > = {
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
                    className: "bg-indigo-400/10 text-indigo-500",
                    spinner: true,
                },
                ready: {
                    label: t("status_ready"),
                    className: "bg-green-400/10 text-green-500",
                },
                assigned: {
                    label: t("status_assigned"),
                    className: "bg-blue-400/10 text-blue-500",
                },
                in_transit: {
                    label: t("status_in_transit"),
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

            return (
                <Badge className={config.className}>
                    {config.spinner && <Spinner />}
                    {config.label}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const id = row.original.id;
            const navigate = useNavigate();
            const deliveryJob = row.original;
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
                                        to: "/manager/delivery-jobs/$id",
                                        params: { id },
                                    })
                                }
                            >
                                <Eye /> {t("view_details")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit /> {t("edit_delivery_job")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DialogTrigger className="flex items-center gap-2">
                                <DropdownMenuItem className="text-destructive">
                                    <Trash className="text-destructive" />
                                    {t("remove_delivery_job")}
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
                                    await onDelete(deliveryJob.id);
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
