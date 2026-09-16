import { describe, expect, it } from "vitest";
import { ALLERGEN_FALLBACK, formatAllergenLabel } from "./allergens";

const FALLBACK = "Consultá antes de comprar: información de alérgenos no disponible.";

describe("formatAllergenLabel", () => {
    it("fallback con undefined", () => {
        expect(formatAllergenLabel(undefined)).toBe(FALLBACK);
    });

    it("fallback con null", () => {
        expect(formatAllergenLabel(null)).toBe(FALLBACK);
    });

    it("fallback con array vacío o solo espacios", () => {
        expect(formatAllergenLabel([])).toBe(FALLBACK);
        expect(formatAllergenLabel(["   ", ""])).toBe(FALLBACK);
    });

    it("exporta el mismo fallback que devuelve", () => {
        expect(ALLERGEN_FALLBACK).toBe(FALLBACK);
    });

    it("un alérgeno", () => {
        expect(formatAllergenLabel(["leche"])).toBe("Contiene: Leche.");
    });

    it("varios alérgenos en orden de aparición", () => {
        expect(formatAllergenLabel(["leche", "avellana", "gluten"])).toBe(
            "Contiene: Leche, Avellana, Gluten."
        );
    });

    it("alias en inglés mapean a español", () => {
        expect(formatAllergenLabel(["milk", "hazelnut", "soy"])).toBe(
            "Contiene: Leche, Avellana, Soja."
        );
    });

    it("trim + dedupe case-insensitive", () => {
        expect(formatAllergenLabel([" Leche ", "leche", "SOJA"])).toBe(
            "Contiene: Leche, Soja."
        );
    });

    it("valor desconocido se capitaliza", () => {
        expect(formatAllergenLabel(["maní"])).toBe("Contiene: Maní.");
    });

    it("contenido por producto, no genérico", () => {
        const a = formatAllergenLabel(["leche"]);
        const b = formatAllergenLabel(["gluten", "soja"]);
        expect(a).not.toBe(b);
        expect(b).toBe("Contiene: Gluten, Soja.");
    });
});
