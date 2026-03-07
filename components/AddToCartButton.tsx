"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { Product } from "@/lib/supabase/types";

export default function AddToCartButton({ product }: Readonly<{ product: Product }>) {
    const { addItem } = useCart();
    
    // Handle both string and number IDs
    const productWithStringId = {
        ...product,
        id: String(product.id),
    };
    
    return (
        <button 
            onClick={() => addItem(productWithStringId)}
            className="flex-1 bg-antique-gold text-black px-8 py-3 rounded-full uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-3"
        >
            <ShoppingBag size={18} />
            Añadir al Carrito
        </button>
    );
}
