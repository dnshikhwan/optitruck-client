import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { type AuthState } from "@/auth";
import { NextStepProvider, NextStepReact } from "nextstepjs";
import { useTanStackRouterAdapter } from "@/lib/tanstack-router-adapter";
import ShadcnDarkModeCard from "@/components/DarkModeCard";
import { useOnboardingSteps } from "@/lib/onboarding-steps";

interface MyRouterContext {
    auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    component: () => {
        const { theme } = useTheme();
        const steps = useOnboardingSteps();

        return (
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <NextStepProvider>
                    <NextStepReact
                        steps={steps}
                        cardComponent={ShadcnDarkModeCard}
                        navigationAdapter={useTanStackRouterAdapter}
                        shadowRgb={theme === "dark" ? "0, 0, 0" : "0, 0, 0"}
                        shadowOpacity="0.8"
                    >
                        <Outlet />
                    </NextStepReact>
                </NextStepProvider>
                <TanStackDevtools
                    config={{ position: "bottom-right" }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Toaster richColors position="top-right" expand={true} />
            </ThemeProvider>
        );
    },
});
