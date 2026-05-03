// src/lib/tanstack-router-adapter.ts
import { useNavigate } from "@tanstack/react-router";
import type { NavigationAdapter } from "nextstepjs";

export const useTanStackRouterAdapter = (): NavigationAdapter => {
    const navigate = useNavigate();
    return {
        push: (path: string) => navigate({ to: path }),
        getCurrentPath: () => window.location.pathname,
    };
};
