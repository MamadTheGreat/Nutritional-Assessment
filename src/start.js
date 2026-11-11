import { createStart } from "@tanstack/react-start";

// Patient records stay in the signed-in user's Google Drive.
// AI routes check the Google token themselves and read Gemini settings on the server.
export const startInstance = createStart(() => ({}));
