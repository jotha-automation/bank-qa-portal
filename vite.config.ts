import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    ...tanstackStart({
      // Custom SSR wrapper in src/server.ts (error capture + HTML fallback).
      server: { entry: "./src/server.ts" },
    }),
    react(),
    tailwindcss(),
    nitro(),
  ],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
  server: {
    port: Number(process.env.PORT) || 8080,
    host: true,
    strictPort: false,
  },
});
