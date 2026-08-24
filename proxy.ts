import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs on (almost) every request: refreshes the Supabase session cookie so
 * Server Components/Actions always see a valid session, and — for /admin
 * routes only — verifies the caller is an admin before the route renders.
 *
 * Note on Next.js 16: this file is intentionally named `proxy.ts`, not
 * `middleware.ts` — the latter was renamed/deprecated in this version (see
 * node_modules/next/dist/docs/.../file-conventions/middleware.md).
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required to actually refresh the session — do not remove even though
  // the result isn't used outside the /admin branch below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (isAdminRoute && !isAdminLogin) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // A single-row lookup here is a deliberate exception to "keep proxy
    // cheap" — /admin is a small, non-prefetched, authenticated-only area,
    // and role isn't derivable from the session cookie alone. Every admin
    // page/action also re-checks via requireAdmin() (lib/auth/dal.ts) as
    // defense-in-depth per the backend brief's §9 "not just hiding links".
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
