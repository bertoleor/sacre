// SACRÉ P0-1 — Validación pura del formulario de login admin.
// Sin credenciales hardcodeadas: la autenticación real es Supabase Auth
// (server action en app/admin/login/actions.ts), acá solo validamos forma.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LENGTH = 200; // bcrypt/argon truncan; evita DoS de hashing

export type LoginInput = { email: string; password: string } | { ok: false; error: string };

type Validated =
    | { ok: true; email: string; password: string }
    | { ok: false; error: string };

/** Validación de forma del formulario de login. Nada de credenciales mágicas. */
export function validateLoginForm(
    email: unknown,
    password: unknown
): Validated {
    if (typeof email !== "string" || typeof password !== "string") {
        return { ok: false, error: "Completá email y contraseña." };
    }
    const e = email.trim();
    if (!EMAIL_RE.test(e)) {
        return { ok: false, error: "Ingresá un email válido." };
    }
    if (password.length === 0) {
        return { ok: false, error: "Ingresá tu contraseña." };
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
        return { ok: false, error: "Contraseña demasiado larga." };
    }
    return { ok: true, email: e, password };
}

/** Mapea códigos GoTrue a mensajes ES. Nunca expone el código crudo al usuario. */
export function mapAuthError(code: string | undefined | null): string {
    switch (code) {
        case "invalid_credentials":
            return "Credenciales incorrectas.";
        case "email_not_confirmed":
            return "Email no confirmado. Revisá tu correo.";
        case "over_request_rate_limit":
        case "over_email_send_rate_limit":
            return "Demasiados intentos. Reintentá en unos minutos.";
        case "user_banned":
            return "Esta cuenta está deshabilitada.";
        default:
            // Código desconocido: mensaje genérico (no revela internals).
            return "Credenciales incorrectas.";
    }
}
