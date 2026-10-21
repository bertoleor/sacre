import { describe, expect, it } from "vitest";
import {
    ADMIN_LOGIN_PATH,
    isAdminLoginPath,
    isAdminRoute,
    isProtectedAdminPath,
} from "./admin-guard";

describe("isAdminRoute", () => {
    it("/admin exacto es ruta admin", () => {
        expect(isAdminRoute("/admin")).toBe(true);
    });

    it("/admin/ con slash final es ruta admin", () => {
        expect(isAdminRoute("/admin/")).toBe(true);
    });

    it("subrutas admin son ruta admin", () => {
        expect(isAdminRoute("/admin/productos")).toBe(true);
        expect(isAdminRoute("/admin/pedidos/abc-123")).toBe(true);
    });

    it("NO matchea prefijos parecidos (/administracion)", () => {
        expect(isAdminRoute("/administracion")).toBe(false);
        expect(isAdminRoute("/admin-panel")).toBe(false);
    });

    it("NO matchea rutas fuera de admin", () => {
        expect(isAdminRoute("/")).toBe(false);
        expect(isAdminRoute("/checkout")).toBe(false);
        expect(isAdminRoute("")).toBe(false);
    });
});

describe("isAdminLoginPath", () => {
    it("/admin/login exacto es login", () => {
        expect(isAdminLoginPath("/admin/login")).toBe(true);
    });

    it("/admin/login/ con slash final sigue siendo login", () => {
        expect(isAdminLoginPath("/admin/login/")).toBe(true);
    });

    it("/admin/login NO es igual a ADMIN_LOGIN_PATH + basura", () => {
        expect(isAdminLoginPath("/admin/login-x")).toBe(false);
        expect(isAdminLoginPath("/admin/loginando")).toBe(false);
    });

    it("ADMIN_LOGIN_PATH exportado es /admin/login", () => {
        expect(ADMIN_LOGIN_PATH).toBe("/admin/login");
    });
});

describe("isProtectedAdminPath (gate del proxy)", () => {
    it("páginas admin requieren sesión", () => {
        expect(isProtectedAdminPath("/admin")).toBe(true);
        expect(isProtectedAdminPath("/admin/")).toBe(true);
        expect(isProtectedAdminPath("/admin/productos")).toBe(true);
        expect(isProtectedAdminPath("/admin/pedidos/SACRE-001")).toBe(true);
    });

    it("el login es la única ruta admin pública", () => {
        expect(isProtectedAdminPath("/admin/login")).toBe(false);
        expect(isProtectedAdminPath("/admin/login/")).toBe(false);
    });

    it("rutas fuera de admin no estan protegidas (no redirigir jamás)", () => {
        expect(isProtectedAdminPath("/")).toBe(false);
        expect(isProtectedAdminPath("/checkout")).toBe(false);
        expect(isProtectedAdminPath("/admin-otra-cosa")).toBe(false);
    });
});
