import { createFileRoute } from "@tanstack/react-router";
import { handleAiRequest } from "@/lib/googleAi.server";

export const Route = createFileRoute("/api/ai/labs")({
  server: { handlers: { POST: ({ request }) => handleAiRequest(request, "labs") } },
});
