import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "../../../../../../layouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldLabel,
    FieldGroup,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useState } from "react";
import apiFetch from "@/utils/apiFetch";
import * as z from "zod";
import { MapPin, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
    "/_authenticated/_manager/manager/warehouse/",
)({
    component: WarehousePage,
    staticData: {
        breadcrumb: "Warehouse",
    },
});

type WarehouseFormData = {
    address: string;
};

function WarehousePage() {
    const { t } = useTranslation();

    const formSchema = z.object({
        address: z.string().min(1, t("warehouse_address_required")),
    });

    const queryClient = useQueryClient();
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        null,
    );
    const [isGeocoding, setIsGeocoding] = useState(false);

    const { data: company, isLoading } = useQuery({
        queryKey: ["company-me"],
        queryFn: async () => {
            const res = await apiFetch("/companies/me");
            if (!res.ok) throw new Error("Failed to fetch company");
            const json = await res.json();
            const data = json.data;
            if (data.warehouseLat && data.warehouseLng) {
                setCoords({
                    lat: Number(data.warehouseLat),
                    lng: Number(data.warehouseLng),
                });
            }
            return data;
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: {
            warehouseLat: number;
            warehouseLng: number;
        }) => {
            const res = await apiFetch("/companies/me", {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success(t("warehouse_location_saved"));
            queryClient.invalidateQueries({ queryKey: ["company-me"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm({
        defaultValues: {
            address: "",
        } as WarehouseFormData,
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async () => {
            if (!coords) {
                toast.error(t("please_find_coordinates"));
                return;
            }
            await updateMutation.mutateAsync({
                warehouseLat: coords.lat,
                warehouseLng: coords.lng,
            });
        },
    });

    async function geocodeAddress(address: string) {
        if (!address.trim()) return;
        setIsGeocoding(true);
        try {
            const res = await fetch(
                `https://catalog.api.2gis.com/3.0/items/geocode?q=${encodeURIComponent(address)}&fields=items.point&key=${import.meta.env.VITE_2GIS_API_KEY}`,
            );
            const data = await res.json();
            if (data.result?.items?.length > 0) {
                const { lat, lon } = data.result.items[0].point;
                setCoords({ lat, lng: lon });
                toast.success(t("location_found"));
            } else {
                toast.error(t("address_not_found"));
                setCoords(null);
            }
        } catch {
            toast.error(t("geocoding_failed"));
            setCoords(null);
        } finally {
            setIsGeocoding(false);
        }
    }

    const hasWarehouse = company?.warehouseLat && company?.warehouseLng;

    return (
        <DashboardLayout>
            <h1
                id="profile-section"
                className="scroll-m-20 text-xl font-extrabold font-heading"
            >
                {t("warehouse_settings")}
            </h1>

            <div className="flex flex-col lg:flex-row gap-4 w-full">
                <Card id="set-warehouse-location" className="flex-1 min-w-0">
                    <CardContent>
                        <form
                            id="warehouse-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.handleSubmit();
                            }}
                            className="w-full flex flex-col gap-6"
                        >
                            <FieldSet>
                                <FieldLegend>
                                    <div className="flex h-5 items-center gap-2 text-xs tracking-widest uppercase">
                                        <span className="text-orange-500">
                                            01
                                        </span>
                                        <Separator orientation="vertical" />
                                        {t("warehouse_location")}
                                    </div>
                                </FieldLegend>
                                <FieldGroup>
                                    <form.Field
                                        name="address"
                                        children={(field) => {
                                            const isInvalid =
                                                field.state.meta.isTouched &&
                                                !field.state.meta.isValid;
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel
                                                        htmlFor={field.name}
                                                    >
                                                        {t("warehouse_address")}
                                                    </FieldLabel>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id={field.name}
                                                            name={field.name}
                                                            value={
                                                                field.state
                                                                    .value
                                                            }
                                                            onBlur={
                                                                field.handleBlur
                                                            }
                                                            onChange={(e) => {
                                                                field.handleChange(
                                                                    e.target
                                                                        .value,
                                                                );
                                                                setCoords(null);
                                                            }}
                                                            aria-invalid={
                                                                isInvalid
                                                            }
                                                            placeholder={t(
                                                                "warehouse_address_placeholder",
                                                            )}
                                                            autoComplete="off"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={
                                                                isGeocoding ||
                                                                !field.state
                                                                    .value
                                                            }
                                                            onClick={() =>
                                                                geocodeAddress(
                                                                    field.state
                                                                        .value,
                                                                )
                                                            }
                                                        >
                                                            {isGeocoding
                                                                ? t("finding")
                                                                : t("find")}
                                                        </Button>
                                                    </div>
                                                    {coords && (
                                                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            {coords.lat.toFixed(
                                                                5,
                                                            )}
                                                            ,{" "}
                                                            {coords.lng.toFixed(
                                                                5,
                                                            )}
                                                        </p>
                                                    )}
                                                    {isInvalid && (
                                                        <FieldError
                                                            className="text-red-500"
                                                            errors={
                                                                field.state.meta
                                                                    .errors
                                                            }
                                                        />
                                                    )}
                                                </Field>
                                            );
                                        }}
                                    />
                                </FieldGroup>
                            </FieldSet>
                            <Button
                                type="submit"
                                form="warehouse-form"
                                disabled={!coords || updateMutation.isPending}
                                className="w-fit"
                            >
                                {t("save_warehouse_location")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="w-full lg:w-1/3 h-fit">
                    <CardHeader>
                        <h2 className="text-xs tracking-widest uppercase font-heading">
                            {t("current_warehouse")}
                        </h2>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-xs text-muted-foreground">
                                {t("loading")}
                            </p>
                        ) : hasWarehouse ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-green-500">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-xs font-medium">
                                        {t("location_set")}
                                    </span>
                                </div>
                                <div className="bg-muted/40 border border-gray-800 rounded-md p-3 flex flex-col gap-1">
                                    <p className="text-xs text-muted-foreground">
                                        {t("latitude")}
                                    </p>
                                    <p className="text-sm font-mono">
                                        {Number(company.warehouseLat).toFixed(
                                            6,
                                        )}
                                    </p>
                                    <Separator className="my-1" />
                                    <p className="text-xs text-muted-foreground">
                                        {t("longitude")}
                                    </p>
                                    <p className="text-sm font-mono">
                                        {Number(company.warehouseLng).toFixed(
                                            6,
                                        )}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">
                                    {t("no_warehouse_set")}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
