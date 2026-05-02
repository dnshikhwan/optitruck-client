import type { DeliveryJob } from "@/interfaces/deliveryJob";
import apiFetch from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";

export function useDailyDeliveryJobsStats() {
    return useQuery<any, Error, DeliveryJob[]>({
        queryKey: ["delivery-jobs"],
        queryFn: async () => {
            const res = await apiFetch("/delivery-jobs");
            if (!res.ok) throw new Error("Error fetching delivery jobs");
            return res.json();
        },
        select: (response) => response.data ?? [],
    });
}
