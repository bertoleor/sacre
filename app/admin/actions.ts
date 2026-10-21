"use server";

import { redirect } from "next/navigation";
import { createSupabaseSessionClient } from "@/lib/supabase/server";

/**
 * SACRÉ P0-1 — Logout admin. Revoca la sesión en GoTrue y limpia las
 * cookies httpOnly (las escribe el server, nunca JS del cliente).
 */
export async function logoutAction(): Promise<void> {
    const supabase = await createSupabaseSessionClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}
