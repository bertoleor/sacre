import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hardenCookieOptions } from "./cookie-hardening";

/**
 * SACRÉ P0-1 — Cliente Supabase de sesión server-side (Server Actions / RSC).
 *
 * La sesión vive SOLO en cookies httpOnly (ver cookie-hardening.ts); el
 * patrón localStorage de la auth vieja quedó eliminado. En Server Components
 * el cookieStore es de solo lectura: setAll falla silenciosamente y el
 * refresh real lo persiste proxy.ts (que sí puede escribir cookies).
 */
export async function createSupabaseSessionClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Supabase no configurado: falta NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
        );
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, hardenCookieOptions(options));
                    });
                } catch {
                    // Server Component: cookies de solo lectura — proxy.ts
                    // persiste las cookies rotadas. No es un error.
                }
            },
        },
    });
}
