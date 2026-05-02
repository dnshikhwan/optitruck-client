import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Check, CheckLine, Copy, Plus, TruckIcon, X } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import StatisticsCard from "@/components/statistics-card";
import {
    createDriverColumns,
    type Driver,
} from "@/components/tables/drivers/columns";
import { DataTable } from "@/components/tables/drivers/data-table";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/tokenStore";
import apiFetch from "@/utils/apiFetch";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/drivers/",
)({
    component: DriversPage,
    staticData: {
        breadcrumb: "Drivers",
    },
});

function DriversPage() {
    const { t } = useTranslation();
    const access_token = getAccessToken();
    const [url, setUrl] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const driversColumns = useMemo(() => createDriverColumns(t), [t]);

    const { data: driversData = [], isLoading } = useQuery<
        any,
        Error,
        Driver[]
    >({
        queryKey: ["drivers"],
        queryFn: async () => {
            const res = await apiFetch("/drivers");
            if (!res.ok) throw new Error("Error fetching drivers");
            return res.json();
        },
        select: (response) => response.data,
    });

    if (isLoading) return <Spinner />;

    const createInviteUrl = async () => {
        const response = await apiFetch(`/auth/invite`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!response.ok) {
            console.log(response);
        }

        const data = await response.json();
        setUrl(data.data);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    const totalDrivers = driversData.length;

    // Statistics card data
    const StatisticsCardData = [
        {
            icon: <TruckIcon className="size-4" />,
            value: totalDrivers.toString(),
            title: t("total_drivers"),
            changePercentage: "+18.2%",
        },
        {
            icon: <CheckLine className="size-4" />,
            value: "12",
            title: t("active_drivers"),
            changePercentage: "-8.7%",
        },
        {
            icon: <X className="size-4" />,
            value: "8",
            title: t("on_duty_drivers"),
            changePercentage: "-8.7%",
        },
    ];

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <h1 className="scroll-m-20 text-xl font-extrabold font-heading">
                    {t("drivers")}
                </h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button onClick={async () => await createInviteUrl()}>
                            <Plus />
                            {t("add_driver")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t("invite_your_driver")}</DialogTitle>
                            <DialogDescription>
                                {t("invite_driver_description")}
                            </DialogDescription>
                        </DialogHeader>
                        <Separator orientation={"horizontal"} />
                        <div className="grid gap-5">
                            <Field>
                                <FieldLabel>{t("invite_with_link")}</FieldLabel>
                                <ButtonGroup>
                                    <Input disabled value={url} />
                                    <Button
                                        onClick={copyToClipboard}
                                        variant={"secondary"}
                                    >
                                        {isCopied ? (
                                            <div className="flex items-center gap-2">
                                                <Check />
                                                {t("copied")}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Copy />
                                                {t("copy")}
                                            </div>
                                        )}
                                    </Button>
                                </ButtonGroup>
                            </Field>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {StatisticsCardData.map((card, index) => (
                    <StatisticsCard
                        key={index}
                        icon={card.icon}
                        title={card.title}
                        value={card.value}
                    />
                ))}
            </div>
            <Card>
                <CardContent>
                    <DataTable columns={driversColumns} data={driversData} />
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
