import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryJobsDataTable } from "@/components/tables/delivery_jobs/columns";
import { createDeliveryJobColumns } from "@/components/tables/delivery_jobs/data-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "@/utils/apiFetch";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/delivery-jobs/",
)({
    component: DeliveryJobs,
});

function DeliveryJobs() {
    const { t } = useTranslation();
    const deliveryJobsColumns = useMemo(() => createDeliveryJobColumns(t), [t]);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: deliveryJobs = [], isLoading } = useQuery({
        queryKey: ["delivery-jobs"],
        queryFn: async () => {
            const res = await apiFetch("/delivery-jobs");
            if (!res.ok) throw new Error("Error fetching delivery jobs");
            return res.json();
        },
        select: (response) => response.data ?? [],
    });

    const { mutate: deleteDeliveryJob } = useMutation({
        mutationFn: async (id: string) => {
            const res = await apiFetch(`/delivery-jobs/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Error deleting delivery job");
            }

            return res.json();
        },
        onSuccess: () => {
            toast.success("Delivery job deleted successfully");
            queryClient.invalidateQueries({
                queryKey: ["delivery-jobs"],
            });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isLoading) return <Spinner />;

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                    {t("delivery_jobs")}
                </h1>
                <div className="flex items-center gap-2">
                    <Button variant={"outline"}>
                        <Download />
                        {t("export")}
                    </Button>
                    <Button
                        onClick={() =>
                            navigate({ to: "/manager/delivery-jobs/create" })
                        }
                    >
                        <Plus />
                        {t("add_delivery_jobs")}
                    </Button>
                </div>
            </div>
            <Card>
                <CardContent>
                    <DeliveryJobsDataTable
                        columns={deliveryJobsColumns}
                        data={deliveryJobs}
                        pageSize={10}
                        onDelete={(id) => deleteDeliveryJob(id)}
                    />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
