import { type NextRequest } from "next/server";
import { redirectWithSession, updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, claims } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isLoginPath = pathname.startsWith("/login");

  if (isProtectedPath && !claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return redirectWithSession(response, url);
  }

  if (isLoginPath && claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectWithSession(response, url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
