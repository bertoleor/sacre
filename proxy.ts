import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
    ADMIN_LOGIN_PATH,
    isAdminLoginPath,
    isProtectedAdminPath,
} from "@/lib/auth/admin-guard";
import { hardenCookieOptions } from "@/lib/supabase/cookie-hardening";

/**
 * SACRÉ P0-1 — proxy de sesión (Next 16 renombró middleware → proxy).
 *
 * 1. Refresca la sesión contra GoTrue en cada request a /admin y persiste
 *    las cookies rotadas con hardening httpOnly (un Server Component no
 *    puede escribir cookies; este es el único lugar que completa el ciclo).
 * 2. Gate grueso de ruta: sin usuario → /admin/login; usuario logueado en el
 *    login → /admin. El gate fino de autorización (is_admin) vive en el
 *    layout server del route group (dash).
 *
 * getUser() — no getSession(): valida el JWT contra GoTrue, no confía en
 * el contenido de la cookie.
 */

type PendingCookie = { name: string; value: string; options: ReturnType<typeof hardenCookieOptions> };

function redirectTo(request: NextRequest, pathname: string): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next({ request });
    const pathname = request.nextUrl.pathname;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Sin config no hay sesión posible: fail-closed en las rutas admin.
        if (isProtectedAdminPath(pathname)) {
            return redirectTo(request, ADMIN_LOGIN_PATH);
        }
        return response;
    }

    const pendingCookies: PendingCookie[] = [];

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    const hardened = hardenCookieOptions(options);
                    // Los handlers de abajo ven la sesión fresca...
                    request.cookies.set(name, value);
                    // ...y el browser la persiste httpOnly.
                    response.cookies.set(name, value, hardened);
                    pendingCookies.push({ name, value, options: hardened });
                });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtectedAdminPath(pathname)) {
        return redirectTo(request, ADMIN_LOGIN_PATH);
    }

    if (user && isAdminLoginPath(pathname)) {
        // Si GoTrue rotó tokens en el refresh, arrastrarlos al redirect:
        // perder la cookie rotada puede revocar la sesión (refresh token
        // de un solo uso).
        const redirect = redirectTo(request, "/admin");
        pendingCookies.forEach(({ name, value, options }) => {
            redirect.cookies.set(name, value, options);
        });
        return redirect;
    }

    return response;
}

export const config = {
    // /admin y todo lo que cuelga (":path*" = cero o más segmentos).
    matcher: ["/admin/:path*"],
};
