import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SESSION_HEADERS = ["cache-control", "expires", "pragma"] as const;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { response, claims: null };
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims verifies the JWT signature; getSession would trust the raw cookie.
  const { data } = await supabase.auth.getClaims();

  return { response, claims: data?.claims ?? null };
}

// A redirect built from scratch drops the refreshed session cookies and cache headers.
export function redirectWithSession(source: NextResponse, destination: URL) {
  const redirect = NextResponse.redirect(destination);

  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  SESSION_HEADERS.forEach((name) => {
    const value = source.headers.get(name);
    if (value) redirect.headers.set(name, value);
  });

  return redirect;
}
