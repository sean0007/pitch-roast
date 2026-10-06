import { openapiDoc, preflight, staticJson } from "@/lib/agent-api";
import { API_INFO, ENDPOINTS, PUBLIC_URL } from "@/lib/api";

export function GET() {
  return staticJson(openapiDoc(API_INFO, PUBLIC_URL, Object.values(ENDPOINTS)));
}
export const OPTIONS = preflight;
