// SACRÉ P0-1 — Predicados puros del guard de /admin (proxy + layout server).
// Sin estado ni imports de Next: testeable en vitest y reutilizable del lado
// servidor. Default-protect: toda ruta bajo /admin requiere sesión, salvo el
// login (única ruta pública del área).

/** Única ruta pública dentro del área admin. */
export const ADMIN_LOGIN_PATH = "/admin/login";

/** ¿Está la ruta dentro del área /admin? (prefijo exacto, sin falsos positivos) */
export function isAdminRoute(pathname: string): boolean {
    return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** ¿Es la página de login? (con o sin slash final) */
export function isAdminLoginPath(pathname: string): boolean {
    return (
        pathname === ADMIN_LOGIN_PATH ||
        pathname === `${ADMIN_LOGIN_PATH}/`
    );
}

/**
 * ¿Requiere sesión? Toda ruta admin protegida por el proxy/layout.
 * El login queda excluido para no crear un redirect loop.
 * Rutas fuera de /admin devuelven false: el guard jamás toca el storefront.
 */
export function isProtectedAdminPath(pathname: string): boolean {
    return isAdminRoute(pathname) && !isAdminLoginPath(pathname);
}
