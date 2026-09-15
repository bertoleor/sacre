import test from "node:test";
import assert from "node:assert/strict";
import { ALLERGEN_FALLBACK, formatAllergenLabel } from "./allergens.ts";

const FALLBACK = "Consultá antes de comprar: información de alérgenos no disponible.";

test("fallback con undefined", () => {
    assert.equal(formatAllergenLabel(undefined), FALLBACK);
});

test("fallback con null", () => {
    assert.equal(formatAllergenLabel(null), FALLBACK);
});

test("fallback con array vacío o solo espacios", () => {
    assert.equal(formatAllergenLabel([]), FALLBACK);
    assert.equal(formatAllergenLabel(["   ", ""]), FALLBACK);
});

test("exporta el mismo fallback que devuelve", () => {
    assert.equal(ALLERGEN_FALLBACK, FALLBACK);
});

test("un alérgeno", () => {
    assert.equal(formatAllergenLabel(["leche"]), "Contiene: Leche.");
});

test("varios alérgenos en orden de aparición", () => {
    assert.equal(
        formatAllergenLabel(["leche", "avellana", "gluten"]),
        "Contiene: Leche, Avellana, Gluten.",
    );
});

test("alias en inglés mapean a español", () => {
    assert.equal(
        formatAllergenLabel(["milk", "hazelnut", "soy"]),
        "Contiene: Leche, Avellana, Soja.",
    );
});

test("trim + dedupe case-insensitive", () => {
    assert.equal(formatAllergenLabel([" Leche ", "leche", "SOJA"]), "Contiene: Leche, Soja.");
});

test("valor desconocido se capitaliza", () => {
    assert.equal(formatAllergenLabel(["maní"]), "Contiene: Maní.");
});

test("contenido por producto, no genérico", () => {
    const a = formatAllergenLabel(["leche"]);
    const b = formatAllergenLabel(["gluten", "soja"]);
    assert.notEqual(a, b);
    assert.equal(b, "Contiene: Gluten, Soja.");
});
