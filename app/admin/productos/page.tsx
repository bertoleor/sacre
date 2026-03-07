"use client";

import { useState } from "react";
import { products } from "@/lib/data";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, Star, Package, X } from "lucide-react";

export default function AdminProducts() {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { id: "all", name: "Todos" },
        { id: "bombones", name: "Bombones" },
        { id: "tabletas", name: "Tabletas" },
        { id: "especiales", name: "Especiales" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-cronde text-white">Productos</h1>
                    <p className="text-white/40 mt-1">Gestiona el catálogo de productos</p>
                </div>
                <Link
                    href="/admin/productos/new"
                    className="inline-flex items-center gap-2 bg-burgundy text-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-colors"
                >
                    <Plus size={18} />
                    Nuevo Producto
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:border-burgundy focus:outline-none transition-colors"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                                categoryFilter === cat.id
                                    ? "bg-burgundy text-black"
                                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group">
                        {/* Image */}
                        <div className="relative aspect-square">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Link
                                    href={`/productos/${product.id}`}
                                    className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <Eye size={18} className="text-white" />
                                </Link>
                                <Link
                                    href={`/admin/productos/${product.id}`}
                                    className="p-3 bg-burgundy/20 rounded-full hover:bg-burgundy/30 transition-colors"
                                >
                                    <Edit size={18} className="text-burgundy" />
                                </Link>
                            </div>
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                {product.featured && (
                                    <span className="bg-burgundy/80 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star size={12} fill="black" />
                                        Nuevo
                                    </span>
                                )}
                                {(product.stock || 0) < 10 && (
                                    <span className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Package size={12} />
                                        Bajo stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-white font-medium truncate flex-1">{product.name}</h3>
                                <span className="text-burgundy font-medium">${product.price.toLocaleString("es-AR")}</span>
                            </div>
                            <p className="text-white/40 text-sm line-clamp-2 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs uppercase tracking-wider">{product.category}</span>
                                <span className={`text-xs ${(product.stock || 0) > 0 ? "text-green-400" : "text-red-400"}`}>
                                    {(product.stock || 0) > 0 ? `${product.stock} en stock` : "Agotado"}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No se encontraron productos</p>
                </div>
            )}
        </div>
    );
}
