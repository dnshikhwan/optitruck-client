import { getAccessToken } from "@/utils/tokenStore";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: ({ context, location }) => {
        const token = getAccessToken();
        if (!context.auth.isAuthenticated || !token) {
            throw redirect({
                to: "/auth/login",
                search: {
                    // Save current location for redirect after login
                    redirect: location.href,
                },
            });
        }
    },
    component: () => <Outlet />,
});
