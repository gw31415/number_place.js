import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      worker: { format: "es" },
      build: {
        rollupOptions: {
          input: ["./app/client.ts", "./app/style.css"],
        },
        manifest: true,
      },
      plugins: [tsconfigPaths(), tailwindcss()],
    };
  }

  return {
    worker: { format: "es" },
    ssr: {
      external: ["react", "react-dom"],
    },
    plugins: [
      tsconfigPaths(),
      honox({
        devServer: { adapter },
        client: {
          input: ["./app/style.css"],
        },
      }),
      build(),
      tailwindcss(),
    ],
  };
});
