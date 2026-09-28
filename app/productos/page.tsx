import ProductGrid from "@/components/ProductGrid";
import SectionDivider from "@/components/SectionDivider";

// ORN-126: grid fetches from the live DB; ISR keeps stock/price fresh (5 min).
export const revalidate = 300;

export default function Productos() {
    return (
        <main className="pt-32 min-h-screen">
            <SectionDivider variant="bottom" height="h-24" />
            
            <ProductGrid />
            
            <SectionDivider variant="top" height="h-24" />
        </main>
    );
}
