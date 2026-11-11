import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Sync GEMINI_API_KEY from Node environment into .dev.vars for miniflare/workerd if available
const geminiApiKey = process.env.GEMINI_API_KEY || "";
if (geminiApiKey) {
  try {
    let devVars = existsSync(".dev.vars") ? readFileSync(".dev.vars", "utf8") : "";
    const lines = devVars.split("\n").filter((l) => !l.startsWith("GEMINI_API_KEY="));
    lines.push(`GEMINI_API_KEY=${geminiApiKey}`);
    if (!lines.some((l) => l.startsWith("GEMINI_MODEL="))) {
      lines.push("GEMINI_MODEL=gemini-3.8-flash");
    }
    writeFileSync(".dev.vars", lines.filter(Boolean).join("\n") + "\n");
  } catch (err) {
    console.warn("Could not sync .dev.vars:", err);
  }
}

// Every runtime dependency is bundled at startup, for the browser and the SSR worker: one first imported
// mid-session makes Vite re-bundle, and a page rendered meanwhile on the server loads a second React.
// Not listed: React itself, the TanStack Start/Router framework (its plugin bundles it) and build-time plugins.
const NOT_PREBUNDLED = new Set(["react", "react-dom", "@tanstack/react-start", "@tanstack/react-router", "@tanstack/react-router-ssr-query", "tailwindcss-animate", "firebase", "@google/genai"]);
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const PREBUNDLE = Object.keys(dependencies).filter((name) => !NOT_PREBUNDLED.has(name));

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  optimizeDeps: { include: PREBUNDLE },
  environments: {
    ssr: {
      optimizeDeps: { include: PREBUNDLE },
      build: { sourcemap: true, rolldownOptions: { output: { sourcemapExcludeSources: true } } },
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" }, inspectorPort: false }),
    tanstackStart({ srcDirectory: "src" }),
    react(),
  ],
});
