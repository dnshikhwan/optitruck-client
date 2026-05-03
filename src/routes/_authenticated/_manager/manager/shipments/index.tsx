import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import { ShipmentDataTable } from "@/components/tables/shipments/data-table";
import { createShipmentColumns } from "@/components/tables/shipments/columns";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/utils/excel";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { CustomSpinner } from "@/components/custom-spinner";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/shipments/",
)({
    component: Shipments,
    staticData: {
        breadcrumb: "Shipments",
    },
});

function Shipments() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const shipmentsColumns = useMemo(() => createShipmentColumns(t), [t]);

    const { data: shipments, isLoading } = useQuery({
        queryKey: ["shipments"],
        queryFn: async () => {
            const res = await apiFetch("/shipments");
            if (!res.ok) throw new Error("Error fetching shipments");
            return res.json();
        },
        select: (response) => response.data,
    });

    const deleteShipmentMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/shipments/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Error deleting shipment");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Shipment deleted successfully");
            queryClient.invalidateQueries({
                queryKey: ["shipments"],
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isLoading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CustomSpinner />
            </div>
        );

    return (
        <DashboardLayout>
            <div
                id="shipments-table"
                className="flex flex-wrap items-center justify-between gap-3"
            >
                <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                    {t("shipments")}
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => exportToExcel(shipments, "shipments")}
                        variant="outline"
                    >
                        <Download />
                        {t("export")}
                    </Button>
                    <Button
                        onClick={() =>
                            navigate({ to: "/manager/shipments/create" })
                        }
                    >
                        <Plus />
                        {t("add_shipment")}
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent>
                    <ShipmentDataTable
                        columns={shipmentsColumns}
                        data={shipments}
                        pageSize={10}
                        onDelete={(id) => deleteShipmentMutation.mutate(id)}
                    />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
