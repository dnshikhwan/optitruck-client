import apiFetch from "@/utils/apiFetch";
import { useQuery } from "@tanstack/react-query";

async function fetchAlgorithmResult(packingJobId: string, algorithm: string) {
    const res = await apiFetch(
        `/packing/${packingJobId}/result?algorithm=${algorithm}`,
    );
    if (!res.ok) throw new Error("Failed to fetch result");
    return res.json();
}
export function useAlgorithmResult(
    packingJobId: string | undefined,
    algorithm: string,
) {
    return useQuery({
        queryKey: ["algorithm-result", packingJobId, algorithm],
        queryFn: () => fetchAlgorithmResult(packingJobId!, algorithm),
        enabled: !!packingJobId && !!algorithm,
        staleTime: 1000 * 60, // 1 min — there's no reason to refetch this aggressively
        select: (response) => response.data, // trivial, no allocations
    });
}
