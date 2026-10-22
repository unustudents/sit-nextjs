import { NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * Public endpoint to track page view events (FR-023).
 * POST /api/view/[id]
 *
 * Fault tolerant (NFR-015): Always returns a well-formed JSON response,
 * never leaks sensitive database errors, and stores zero visitor PII (NFR-012).
 */
export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "ID halaman wajib diisi" },
      { status: 400 },
    );
  }

  const result = await recordPageView(id);

  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.error === "ID halaman tidak valid" ? 400 : 404 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
