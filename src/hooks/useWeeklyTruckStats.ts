import apiFetch from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";

export function useWeeklyTruckStats() {
    return useQuery({
        queryKey: ["overview", "daily-trucks"],
        queryFn: async () => {
            const res = await apiFetch("/trucks/stats/daily-active-trucks");
            if (!res.ok) throw new Error("Error fetching trucks");
            return res.json();
        },
        select: (response) => response.data,
        staleTime: 1000 * 60 * 5, // cache for 5 minutes, overview doesn't need to be live
    });
}
