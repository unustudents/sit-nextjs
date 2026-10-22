import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  const adminClient = createAdminClient();

  // 1. Fetch link details
  const { data: link, error: linkError } = await adminClient
    .from("links")
    .select("id, page_id, url, is_active")
    .eq("id", id)
    .single();

  if (linkError || !link || !link.is_active) {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  // 2. Verify page status
  const { data: page, error: pageError } = await adminClient
    .from("pages")
    .select("id, status, admin_disabled")
    .eq("id", link.page_id)
    .single();

  if (
    pageError ||
    !page ||
    page.status !== "published" ||
    page.admin_disabled
  ) {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }

  // 3. Record click event asynchronously / fault-tolerant (NFR-015)
  try {
    await adminClient.from("analytics_events").insert({
      page_id: link.page_id,
      link_id: link.id,
      event_type: "link_click",
    });
  } catch (analyticsError) {
    console.error("Failed to record analytics click event:", analyticsError);
  }

  // 4. Safe redirect to validated URL
  try {
    const destination = new URL(link.url);
    if (destination.protocol !== "http:" && destination.protocol !== "https:") {
      return NextResponse.redirect(new URL("/", request.url), { status: 302 });
    }
    return NextResponse.redirect(destination.toString(), { status: 302 });
  } catch {
    return NextResponse.redirect(new URL("/", request.url), { status: 302 });
  }
}
