import Image from "next/image";
import { products } from "@/lib/data";

export default function Productos() {
    return (
        <main className="pt-32 pb-20 px-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="font-cronde text-5xl md:text-7xl mb-16 text-center">Colección</h1>

                <div className="grid md:grid-cols-3 gap-12">
                    {products.map((product) => (
                        <div key={product.id} className="group cursor-pointer">
                            <div className="relative aspect-square w-full mb-6 overflow-hidden">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-cronde text-2xl">{product.name}</h3>
                                <p className="text-sm font-light opacity-70">{product.description}</p>
                                <p className="text-lg mt-4">$ {product.price.toLocaleString("es-AR")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
