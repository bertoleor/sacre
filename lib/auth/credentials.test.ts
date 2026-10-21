import { describe, expect, it } from "vitest";
import {
    mapAuthError,
    validateLoginForm,
} from "./credentials";

describe("validateLoginForm", () => {
    it("rechaza email invalido", () => {
        const res = validateLoginForm("no-es-un-mail", "unapassword");
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.error).toBe("Ingresá un email válido.");
    });

    it("rechaza password vacia", () => {
        const res = validateLoginForm("admin@sacre.com.ar", "");
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.error).toBe("Ingresá tu contraseña.");
    });

    it("rechaza inputs que no son string (undefined/null/number)", () => {
        expect(validateLoginForm(undefined, "x").ok).toBe(false);
        expect(validateLoginForm("a@b.com", null).ok).toBe(false);
        // La firma acepta `unknown` a propósito (no necesita @ts-expect-error):
        // el guard de tipo real vive adentro de validateLoginForm.
        expect(validateLoginForm(123, "x").ok).toBe(false);
    });

    it("rechaza password absurdamente larga (DoS de hashing)", () => {
        const res = validateLoginForm("admin@sacre.com.ar", "a".repeat(1000));
        expect(res.ok).toBe(false);
    });

    it("acepta credenciales validas sin mutarlas", () => {
        const res = validateLoginForm("admin@sacre.com.ar", "una-clave-segura");
        expect(res).toEqual({
            ok: true,
            email: "admin@sacre.com.ar",
            password: "una-clave-segura",
        });
    });
});

describe("mapAuthError", () => {
    it("credenciales invalidas → mensaje generico (sin revelar cual fallo)", () => {
        expect(mapAuthError("invalid_credentials")).toBe(
            "Credenciales incorrectas."
        );
    });

    it("email no confirmado → mensaje especifico", () => {
        expect(mapAuthError("email_not_confirmed")).toContain("confirm");
    });

    it("rate limit → mensaje de reintento", () => {
        expect(mapAuthError("over_request_rate_limit")).toContain("Reintent");
    });

    it("codigo desconocido o sin codigo → generico, nunca el crudo", () => {
        expect(mapAuthError("some_random_internal_code")).toBe(
            "Credenciales incorrectas."
        );
        expect(mapAuthError(undefined)).toBe("Credenciales incorrectas.");
        expect(mapAuthError(undefined)).not.toContain("some_random");
    });
});
