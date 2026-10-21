"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { products, Product } from "@/lib/data";
import { ArrowLeft, Save, X, Star, Package, Trash2 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export default function AdminProductEdit() {
    const router = useRouter();
    const params = useParams();
    const isNew = params.id === "new";
    const productId = params.id as string;

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [tagInput, setTagInput] = useState("");
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
        tags: [],
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Describe el producto con detalles, sabores, origen...",
            }),
        ],
        content: product.description,
        onUpdate: ({ editor }) => {
            setProduct({ ...product, description: editor.getHTML() });
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-white/80",
            },
        },
    });

    useEffect(() => {
        if (!isNew) {
            const existingProduct = products.find(p => p.id === productId);
            if (existingProduct) {
                setProduct(existingProduct);
                if (editor) {
                    editor.commands.setContent(existingProduct.description);
                }
            }
            setLoading(false);
        }
    }, [isNew, productId, editor]);

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            router.push("/admin/productos");
        }, 1000);
    };

    const handleDelete = () => {
        if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            router.push("/admin/productos");
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !(product.tags || []).includes(tagInput.trim())) {
            setProduct({ 
                ...product, 
                tags: [...(product.tags || []), tagInput.trim()] 
            });
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setProduct({ 
            ...product, 
            tags: (product.tags || []).filter(tag => tag !== tagToRemove) 
        });
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

                        {/* Description with TipTap */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Descripción
                            </label>
                            <div className="bg-transparent border border-white/20 rounded-xl overflow-hidden focus-within:border-burgundy transition-colors">
                                {/* Toolbar */}
                                <div className="flex gap-1 p-2 border-b border-white/10 bg-white/5">
                                    <button
                                        onClick={() => editor?.chain().focus().toggleBold().run()}
                                        className={`p-2 rounded-lg hover:bg-white/10 ${editor?.isActive("bold") ? "bg-white/20 text-burgundy" : "text-white/60"}`}
                                        type="button"
                                    >
                                        <span className="font-bold">B</span>
                                    </button>
                                    <button
                                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                                        className={`p-2 rounded-lg hover:bg-white/10 ${editor?.isActive("italic") ? "bg-white/20 text-burgundy" : "text-white/60"}`}
                                        type="button"
                                    >
                                        <span className="italic">I</span>
                                    </button>
                                    <button
                                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                        className={`p-2 rounded-lg hover:bg-white/10 ${editor?.isActive("bulletList") ? "bg-white/20 text-burgundy" : "text-white/60"}`}
                                        type="button"
                                    >
                                        •
                                    </button>
                                    <button
                                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                        className={`p-2 rounded-lg hover:bg-white/10 ${editor?.isActive("orderedList") ? "bg-white/20 text-burgundy" : "text-white/60"}`}
                                        type="button"
                                    >
                                        1.
                                    </button>
                                </div>
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50">
                                Etiquetas
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    className="flex-1 bg-transparent border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-burgundy focus:outline-none transition-colors"
                                    placeholder="Agregar etiqueta (ej: vegano, sin azúcar)"
                                />
                                <button
                                    onClick={addTag}
                                    type="button"
                                    className="px-4 py-2 bg-white/10 text-white/60 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            {/* Tags Display */}
                            {(product.tags || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {(product.tags || []).map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-burgundy/20 text-burgundy rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-white"
                                                type="button"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
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
                        <div 
                            className="text-white/40 text-sm line-clamp-3 mb-2 prose prose-invert"
                            dangerouslySetInnerHTML={{ __html: product.description || "Descripción del producto" }}
                        />
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
