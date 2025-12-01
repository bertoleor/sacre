import { Plus } from "lucide-react";

const PRODUCTS = [
    {
        id: 1,
        name: "Trufa Noir 70%",
        price: "€24.00",
        description: "Intenso chocolate negro con corazón de ganache.",
    },
    {
        id: 2,
        name: "Praliné D'Or",
        price: "€28.00",
        description: "Avellanas del Piamonte bañadas en oro comestible.",
    },
    {
        id: 3,
        name: "Ganache Mystère",
        price: "€32.00",
        description: "Infusión de especias exóticas y chocolate con leche.",
    },
];

export default function ProductGrid() {
    return (
        <section className="py-24 bg-stone-950">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-antique-gold mb-4">
                        Colección Exclusiva
                    </h2>
                    <div className="w-24 h-px bg-antique-gold/30 mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {PRODUCTS.map((product) => (
                        <div
                            key={product.id}
                            className="group relative bg-white/5 border border-white/5 p-8 hover:border-antique-gold/50 transition-all duration-500"
                        >
                            <div className="aspect-square mb-8 bg-stone-900/50 flex items-center justify-center group-hover:bg-stone-900/80 transition-colors">
                                {/* Placeholder for Product Image */}
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 shadow-2xl group-hover:scale-105 transition-transform duration-500" />
                            </div>

                            <div className="space-y-4 text-center">
                                <h3 className="text-xl font-serif text-cream-accent group-hover:text-antique-gold transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-stone-400 text-sm font-light leading-relaxed">
                                    {product.description}
                                </p>
                                <p className="text-antique-gold font-medium tracking-wide pt-2">
                                    {product.price}
                                </p>

                                <button className="w-full mt-6 py-3 border border-white/10 text-stone-300 text-xs uppercase tracking-widest hover:bg-antique-gold hover:text-chocolate-noir hover:border-antique-gold transition-all duration-300 flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Añadir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
