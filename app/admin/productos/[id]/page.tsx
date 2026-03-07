"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { products, Product } from "@/lib/data";
import { ArrowLeft, Save, Upload, X, Star, Package, Trash2 } from "lucide-react";

export default function AdminProductEdit() {
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === "new";
    const productId = params.id as string;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState<Product>({
        id: "",
        name: "",
        description: "",
        price: 0,
        image: "/images/bombones.png",
        images: ["/images/bombones.png"],
        category: "bombones",
        featured: false,
        stock: 0,
    });

    useEffect(() => {
        if (!isNew) {
            const existingProduct = products.find(p => p.id === productId);
            if (existingProduct) {
                setProduct(existingProduct);
            }
            setLoading(false);
        }
    }, [isNew, productId]);

    const handleSave = async () => {
        setSaving(true);
        // In a real app, this would save to a database
        // For now, we'll just simulate a save
        setTimeout(() => {
            setSaving(false);
            router.push("/admin/productos");
        }, 1000);
    };

    const handleDelete = () => {
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            // In a real app, this would delete from database
            router.push("/admin/productos");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-white/20 border-t-burgundy rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/admin/productos")}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-cronde text-white">
                            {isNew ? "Nuevo Producto" : "Editar Producto"}
                        </h1>
                        <p className="text-white/40 mt-1">
                            {isNew ? "Crea un nuevo producto" : "Actualiza la información del producto"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!isNew && (
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Eliminar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-burgundy text-black rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        Guardar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        <h2 className="text-xl font-cronde text-white">Información Básica</h2>
                        
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Nombre del Producto
                            </label>
                            <input
                                type="text"
                                value={product.name}
                                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                placeholder="Ej: Caja Selección de Autor"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Descripción
                            </label>
                            <textarea
                                value={product.description}
                                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                                rows={4}
                                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors resize-none"
                                placeholder="Describe el producto..."
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Categoría
                            </label>
                            <select
                                value={product.category}
                                onChange={(e) => setProduct({ ...product, category: e.target.value as Product["category"] })}
                                className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white focus:border-burgundy focus:outline-none transition-colors"
                            >
                                <option value="bombones">Bombones</option>
                                <option value="tabletas">Tabletas</option>
                                <option value="especiales">Especiales</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        <h2 className="text-xl font-cronde text-white">Precio y Stock</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Price */}
                            <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-widest text-white/50">
                                    Precio (ARS)
                                </label>
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                                    className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                    placeholder="0"
                                />
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <label className="block text-xs uppercase tracking-widest text-white/50">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    value={product.stock}
                                    onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                                    className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                        <h2 className="text-xl font-cronde text-white">Imágenes</h2>
                        
                        {/* Main Image */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Imagen Principal
                            </label>
                            <div className="flex gap-4">
                                <div className="w-32 h-32 rounded-xl bg-white/10 overflow-hidden">
                                    <img 
                                        src={product.image} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={product.image}
                                        onChange={(e) => setProduct({ ...product, image: e.target.value, images: [e.target.value] })}
                                        className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors text-sm"
                                        placeholder="/images/product.png"
                                    />
                                    <p className="text-white/40 text-xs mt-2">
                                        Ruta de la imagen en la carpeta public
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Preview */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Vista Previa</h2>
                        <div className="aspect-square rounded-xl overflow-hidden bg-white/10 mb-4">
                            <img 
                                src={product.image} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h3 className="text-white font-medium mb-1">{product.name || "Nombre del producto"}</h3>
                        <p className="text-white/40 text-sm line-clamp-2 mb-2">
                            {product.description || "Descripción del producto"}
                        </p>
                        <p className="text-burgundy font-medium">
                            ${product.price.toLocaleString("es-AR") || "0"}
                        </p>
                    </div>

                    {/* Options */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h2 className="text-xl font-cronde text-white">Opciones</h2>
                        
                        {/* Featured */}
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Star size={20} className={product.featured ? "text-burgundy" : "text-white/40"} />
                                <span className="text-white">Producto Destacado</span>
                            </div>
                            <div 
                                onClick={() => setProduct({ ...product, featured: !product.featured })}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    product.featured ? "bg-burgundy" : "bg-white/20"
                                }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                                    product.featured ? "translate-x-6" : "translate-x-0.5"
                                }`} />
                            </div>
                        </label>

                        {/* Out of Stock */}
                        <label className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Package size={20} className={(product.stock || 0) === 0 ? "text-red-400" : "text-white/40"} />
                                <span className="text-white">Agotado</span>
                            </div>
                            <div 
                                onClick={() => setProduct({ ...product, stock: (product.stock || 0) === 0 ? 10 : 0 })}
                                className={`w-12 h-6 rounded-full transition-colors ${
                                    (product.stock || 0) === 0 ? "bg-red-500" : "bg-white/20"
                                }`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                                    (product.stock || 0) === 0 ? "translate-x-6" : "translate-x-0.5"
                                }`} />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
