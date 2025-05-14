import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig, type UserConfig } from "vite";

export default defineConfig(({ mode }) => {
  const common: UserConfig = {
    worker: { format: "es" },
    resolve: {
      alias: { "@/": `${new URL("./app", import.meta.url)}/` },
    },
  };

  if (mode === "client") {
    return Object.assign(common, {
      build: {
        rollupOptions: {
          input: ["./app/client.ts", "./app/style.css"],
        },
        manifest: true,
      },
      plugins: [tailwindcss()],
    } satisfies UserConfig);
  }

  return Object.assign(common, {
    ssr: {
      external: ["react", "react-dom"],
    },
    plugins: [
      honox({
        devServer: { adapter },
        client: {
          input: ["./app/style.css"],
        },
      }),
      build(),
      tailwindcss(),
    ],
  } satisfies UserConfig);
});
