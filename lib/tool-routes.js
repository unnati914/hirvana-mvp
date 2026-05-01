/** Feature catalog `id` → in-app tool path (MVP pages). */
const TOOL_ROUTES = {
  tracker: "/tracker",
  "interview-copilot": "/prep",
  "resume-ai": "/resume",
};

export function getToolHref(featureId) {
  if (!featureId || typeof featureId !== "string") return null;
  return TOOL_ROUTES[featureId] || null;
}
