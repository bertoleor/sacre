import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminForbidden from "@/components/admin/AdminForbidden";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/admin-guard";
import { createSupabaseSessionClient } from "@/lib/supabase/server";

/**
 * SACRÉ P0-1 — Layout server-side del área admin.
 *
 * Route group (dash): /admin/login queda FUERA de este gate (si no, el
 * chequeo de sesión redirigiría el login en loop). La sesión se valida del
 * lado servidor contra GoTrue (cookies httpOnly) — cero localStorage.
 *
 * Doble capa:
 *   1. sesión (getUser) — sin usuario → login;
 *   2. membership (RPC is_admin, migración 0003) — autenticado sin fila en
 *      admin_users ve la pantalla de rechazo, ni siquiera el chrome del
 *      panel. La capa 3 es RLS en la DB (0 filas aunque alguien bypasee la UI).
 */
export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createSupabaseSessionClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(ADMIN_LOGIN_PATH);
    }

    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin !== true) {
        return <AdminForbidden />;
    }

    return <AdminShell>{children}</AdminShell>;
}
