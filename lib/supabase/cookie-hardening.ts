// SACRÉ P0-1 — Hardening de las cookies de sesión Supabase.
// @supabase/ssr emite por defecto httpOnly:false (DEFAULT_COOKIE_OPTIONS en
// dist/main/utils/constants.js); la decisión del ticket es sesión server-side
// con cookie httpOnly, así que TODA escritura de cookie de sesión pasa por
// acá: ni el cliente ni un XSS pueden leer la sesión.
//
// Pure module (sin imports de Next): lo comparten server.ts y proxy.ts.

/** Lo que pasa @supabase/ssr por cookie (Partial<SerializeOptions> de `cookie`): sameSite puede ser boolean. */
export type SupabaseCookieOptions = {
    domain?: string;
    path?: string;
    maxAge?: number;
    sameSite?: boolean | "strict" | "lax" | "none";
    secure?: boolean;
    httpOnly?: boolean;
    partitioned?: boolean;
    [key: string]: unknown;
};

/** Salida hardenada: atributos de sesión no negociables. */
export type HardenedCookieOptions = {
    domain?: string;
    path: string;
    maxAge?: number;
    sameSite: "strict" | "lax" | "none";
    httpOnly: boolean;
    secure: boolean;
    partitioned?: boolean;
};

/**
 * Fuerza httpOnly (+lax y secure en producción) sobre las options que emite
 * @supabase/ssr. Pisa cualquier default inseguro del library.
 */
export function hardenCookieOptions(
    options: SupabaseCookieOptions = {}
): HardenedCookieOptions {
    return {
        domain: typeof options.domain === "string" ? options.domain : undefined,
        path: typeof options.path === "string" ? options.path : "/",
        maxAge: typeof options.maxAge === "number" ? options.maxAge : undefined,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        partitioned: options.partitioned === true,
    };
}
