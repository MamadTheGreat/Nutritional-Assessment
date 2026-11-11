import { createFileRoute } from "@tanstack/react-router";
import { handleAiRequest } from "@/lib/googleAi.server";

export const Route = createFileRoute("/api/ai/plan")({
  server: { handlers: { POST: ({ request }) => handleAiRequest(request, "plan") } },
});
