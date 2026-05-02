import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { useAuth } from "@/auth";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        socket.connect();

        socket.on("connect", () => {
            console.log("client connected");
        });

        socket.on("delivery-job-update", (data) => {
            queryClient.invalidateQueries({
                queryKey: [`delivery-job-${data.jobId}`],
            });
            queryClient.invalidateQueries({ queryKey: ["delivery-jobs"] });

            if (data.status === "ready") {
                toast.success("Optimization complete — results are ready!");
            } else if (data.status === "optimizing") {
                toast.info("Optimization is running...");
            } else if (data.status === "failed") {
                toast.error("Optimization failed — please try again.");
            }
        });

        return () => {
            socket.off("delivery-job-update");
            socket.disconnect();
        };
    }, [queryClient, isAuthenticated, user]);

    return <>{children}</>;
}
