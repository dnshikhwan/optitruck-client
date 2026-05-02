import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_manager")({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.hasRole("manager")) {
            throw redirect({
                to: "/unauthorized",
                search: {
                    redirect: location.href,
                    reason: "insufficient_role",
                },
            });
        }
    },
    staticData: {
        breadcrumb: "Manager",
    },
    component: () => <Outlet />,
});
