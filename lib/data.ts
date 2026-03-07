export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    images: string[];
    category: "bombones" | "tabletas" | "especiales";
    featured?: boolean;
    stock?: number;
}

export const products: Product[] = [
    {
        id: "caja-seleccion",
        name: "Caja Selección de Autor",
        description: "Doce piezas únicas pintadas a mano con cacao puro de origen.",
        price: 18000,
        image: "/images/bombones.png",
        images: ["/images/bombones.png"],
        category: "bombones",
        featured: true,
        stock: 15,
    },
    {
        id: "tableta-origen-70",
        name: "Tableta Origen 70%",
        description: "Cacao puro con notas frutales y aroma intenso.",
        price: 6900,
        image: "/images/tableta.png",
        images: ["/images/tableta.png"],
        category: "tabletas",
        stock: 30,
    },
    {
        id: "edicion-festiva",
        name: "Edición Festiva",
        description: "Sabores de temporada y especias cálidas.",
        price: 7200,
        image: "/images/bombones_navidad3.png",
        images: ["/images/bombones_navidad3.png"],
        category: "especiales",
        featured: true,
        stock: 20,
    },
    {
        id: "bombones-navidad-1",
        name: "Caja Navideña Premium",
        description: "24 bombones artesanales con temas festivos.",
        price: 24500,
        image: "/images/bombones_navidad1.png",
        images: ["/images/bombones_navidad1.png"],
        category: "especiales",
        stock: 10,
    },
    {
        id: "bombones-navidad-2",
        name: "Caja Medallones Dorados",
        description: "Medallones de chocolate con relleno de avellanas.",
        price: 15800,
        image: "/images/bombones_navidad2.png",
        images: ["/images/bombones_navidad2.png"],
        category: "bombones",
        stock: 25,
    },
    {
        id: "tableta-85",
        name: "Tableta Origen 85%",
        description: "Intensidad máxima para verdaderos amantes del cacao.",
        price: 7500,
        image: "/images/tableta.png",
        images: ["/images/tableta.png"],
        category: "tabletas",
        stock: 30,
    },
    {
        id: "tableta-leche",
        name: "Tableta de Leche",
        description: "Equilibrio perfecto entre cacao y cremosidad.",
        price: 5900,
        image: "/images/tableta.png",
        images: ["/images/tableta.png"],
        category: "tabletas",
        stock: 35,
    },
    {
        id: "trufa-negra",
        name: "Truffles Noire",
        description: "Trufas de chocolate negro con núcleo líquido.",
        price: 9200,
        image: "/images/bombones.png",
        images: ["/images/bombones.png"],
        category: "bombones",
        stock: 18,
    },
];

export const categories = [
    { id: "bombones", name: "Bombones", icon: "🍫" },
    { id: "tabletas", name: "Tabletas", icon: "⬜" },
    { id: "especiales", name: "Ediciones Especiales", icon: "🎁" },
];
