export const ALLERGEN_FALLBACK =
    "Consultá antes de comprar: información de alérgenos no disponible.";

const CANONICAL_LABELS: Record<string, string> = {
    leche: "Leche",
    milk: "Leche",
    avellana: "Avellana",
    avellanas: "Avellana",
    hazelnut: "Avellana",
    hazelnuts: "Avellana",
    nuez: "Frutos secos",
    nueces: "Frutos secos",
    nuts: "Frutos secos",
    walnut: "Frutos secos",
    gluten: "Gluten",
    soja: "Soja",
    soy: "Soja",
    huevo: "Huevo",
    huevos: "Huevo",
    egg: "Huevo",
    eggs: "Huevo",
};

function canonicalLabel(raw: string): string {
    const key = raw.trim().toLowerCase();
    const known = CANONICAL_LABELS[key];
    if (known !== undefined) return known;
    const trimmed = raw.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function formatAllergenLabel(allergens: readonly string[] | null | undefined): string {
    if (allergens == null) return ALLERGEN_FALLBACK;
    const seen = new Set<string>();
    const labels: string[] = [];
    for (const item of allergens) {
        if (typeof item !== "string") continue;
        const key = item.trim().toLowerCase();
        if (key === "" || seen.has(key)) continue;
        seen.add(key);
        labels.push(canonicalLabel(item));
    }
    if (labels.length === 0) return ALLERGEN_FALLBACK;
    return `Contiene: ${labels.join(", ")}.`;
}
