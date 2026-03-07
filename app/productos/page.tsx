import ProductGrid from "@/components/ProductGrid";
import SectionDivider from "@/components/SectionDivider";

export default function Productos() {
    return (
        <main className="pt-32 min-h-screen">
            <SectionDivider variant="bottom" height="h-24" />
            
            <ProductGrid />
            
            <SectionDivider variant="top" height="h-24" />
        </main>
    );
}
