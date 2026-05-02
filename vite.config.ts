import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        devtools(),
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        viteReact(),
        tailwindcss(),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
            {
                find: "next/navigation",
                replacement: path.join(
                    process.cwd(),
                    "src/lib/mock/next-navigation.ts",
                ),
            },
        ],
    },
    ssr: {
        noExternal: ["nextstepjs", "motion"],
    },
});
