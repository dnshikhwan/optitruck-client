import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { type AuthState } from "@/auth";

interface MyRouterContext {
    auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Outlet />
                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Toaster richColors position={"top-right"} expand={true} />
            </ThemeProvider>
        </>
    ),
});
