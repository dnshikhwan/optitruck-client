import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_driver")({
    beforeLoad: ({ context, location }) => {
        if (!context.auth.hasRole("driver")) {
            throw redirect({
                to: "/unauthorized",
                search: {
                    redirect: location.href,
                    reason: "insufficient_role",
                },
            });
        }
    },
    component: () => <Outlet />,
});
