"use server";

import { redirect } from "next/navigation";
import { mapAuthError, validateLoginForm } from "@/lib/auth/credentials";
import { createSupabaseSessionClient } from "@/lib/supabase/server";

export interface LoginActionState {
    error: string;
}

/**
 * SACRÉ P0-1 — Login admin REAL contra Supabase Auth (email/password).
 *
 * Sin credenciales hardcodeadas: valida forma (lib/auth/credentials) y
 * autentica contra GoTrue. La sesión se setea SOLO del lado servidor como
 * cookies httpOnly (lib/supabase/server.ts) — el cliente jamás ve tokens.
 * En éxito, redirect("/admin") viaja en la misma respuesta con el
 * Set-Cookie del server action.
 */
export async function loginAction(
    _prevState: LoginActionState,
    formData: FormData
): Promise<LoginActionState> {
    const validated = validateLoginForm(
        formData.get("email"),
        formData.get("password")
    );
    if (!validated.ok) {
        return { error: validated.error };
    }

    const supabase = await createSupabaseSessionClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
    });

    if (error || !data.user) {
        return { error: mapAuthError(error?.code) };
    }

    // Éxito — la sesión quedó en cookies httpOnly; redirect del server action.
    redirect("/admin");
}
