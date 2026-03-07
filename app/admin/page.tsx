import { products } from "@/lib/data";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

// Mock data for dashboard (in a real app this would come from a database)
const stats = [
    { name: "Productos Activos", value: products.length, icon: Package, change: "+2" },
    { name: "Pedidos Hoy", value: 5, icon: ShoppingCart, change: "+3" },
    { name: "Ingresos del Mes", value: "$245.000", icon: DollarSign, change: "+18%" },
    { name: "Tasa de Conversión", value: "3.2%", icon: TrendingUp, change: "+0.5%" },
];

const recentOrders = [
    { id: "SACRE-001", customer: "Juan Pérez", total: 18500, status: "pendiente", date: "2024-01-15" },
    { id: "SACRE-002", customer: "María García", total: 24000, status: "procesando", date: "2024-01-15" },
    { id: "SACRE-003", customer: "Carlos López", total: 7200, status: "entregado", date: "2024-01-14" },
    { id: "SACRE-004", customer: "Ana Martínez", total: 15800, status: "cancelado", date: "2024-01-14" },
];

const lowStockProducts = products.filter(p => (p.stock || 0) < 15);

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-cronde text-white">Dashboard</h1>
                <p className="text-white/40 mt-1">Bienvenido al panel de administración</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/40 text-sm">{stat.name}</p>
                                <p className="text-2xl font-cronde text-white mt-1">{stat.value}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-burgundy/10 flex items-center justify-center">
                                <stat.icon className="text-burgundy" size={24} />
                            </div>
                        </div>
                        <p className="text-burgundy text-sm mt-4">{stat.change} vs mes anterior</p>
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-cronde text-white">Pedidos Recientes</h2>
                        <Link href="/admin/pedidos" className="text-burgundy text-sm hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div>
                                    <p className="text-white font-medium">{order.customer}</p>
                                    <p className="text-white/40 text-sm">{order.id} • {order.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">${order.total.toLocaleString("es-AR")}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        order.status === "pendiente" ? "bg-yellow-500/20 text-yellow-400" :
                                        order.status === "procesando" ? "bg-blue-500/20 text-blue-400" :
                                        order.status === "entregado" ? "bg-green-500/20 text-green-400" :
                                        "bg-red-500/20 text-red-400"
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-cronde text-white">Stock Bajo</h2>
                        <Link href="/admin/productos" className="text-burgundy text-sm hover:underline">
                            Ver todos
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{product.name}</p>
                                        <p className="text-white/40 text-sm">{product.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-400 font-medium">{product.stock} unidades</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                    href="/admin/productos/new" 
                    className="bg-burgundy/10 border border-burgundy/30 hover:border-burgundy rounded-2xl p-6 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-burgundy/20 flex items-center justify-center group-hover:bg-burgundy/30 transition-colors">
                            <Package className="text-burgundy" size={24} />
                        </div>
                        <div>
                            <p className="text-white font-medium">Agregar Producto</p>
                            <p className="text-white/40 text-sm">Crea un nuevo producto</p>
                        </div>
                    </div>
                </Link>
                <Link 
                    href="/admin/pedidos" 
                    className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                            <ShoppingCart className="text-white/60" size={24} />
                        </div>
                        <div>
                            <p className="text-white font-medium">Gestionar Pedidos</p>
                            <p className="text-white/40 text-sm">Ver y actualizar pedidos</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
