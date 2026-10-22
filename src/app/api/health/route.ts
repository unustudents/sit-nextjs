import { NextResponse } from "next/server";
import { getHealthStatus } from "./_lib/get-health-status";

export async function GET() {
  const health = getHealthStatus();

  return NextResponse.json(health, {
    status: health.status === "healthy" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
