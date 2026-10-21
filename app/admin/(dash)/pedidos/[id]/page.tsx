"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, CheckCircle, Clock, XCircle, Send, Save } from "lucide-react";

type OrderStatus = "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";

// Mock order data
const orderData = {
    "SACRE-001": {
        id: "SACRE-001",
        customer: { name: "Juan Pérez", email: "juan@email.com", phone: "11 1234 5678" },
        items: [
            { name: "Caja Selección de Autor", quantity: 1, price: 18000 },
            { name: "Tableta Origen 70%", quantity: 2, price: 6900 },
        ],
        subtotal: 31800,
        shipping: 2500,
        total: 34300,
        status: "pendiente" as OrderStatus,
        paymentMethod: "mercadopago",
        shippingMethod: "delivery",
        address: "Av. Corrientes 1234, Buenos Aires",
        date: "2024-01-15T10:30:00",
    },
    "SACRE-002": {
        id: "SACRE-002",
        customer: { name: "María García", email: "maria@email.com", phone: "11 2345 6789" },
        items: [
            { name: "Edición Festiva", quantity: 1, price: 7200 },
        ],
        subtotal: 7200,
        shipping: 0,
        total: 7200,
        status: "procesando" as OrderStatus,
        paymentMethod: "transfer",
        shippingMethod: "pickup",
        address: "Jorge Luis Borges 2100, Palermo",
        date: "2024-01-15T14:22:00",
    },
    "SACRE-003": {
        id: "SACRE-003",
        customer: { name: "Carlos López", email: "carlos@email.com", phone: "11 3456 7890" },
        items: [
            { name: "Caja Navideña Premium", quantity: 1, price: 24500 },
            { name: "Truffles Noire", quantity: 2, price: 9200 },
        ],
        subtotal: 42900,
        shipping: 3500,
        total: 46400,
        status: "entregado" as OrderStatus,
        paymentMethod: "mercadopago",
        shippingMethod: "delivery",
        address: "Calle Falsa 123, Buenos Aires",
        date: "2024-01-14T09:15:00",
    },
    "SACRE-004": {
        id: "SACRE-004",
        customer: { name: "Ana Martínez", email: "ana@email.com", phone: "11 4567 8901" },
        items: [
            { name: "Tableta Origen 85%", quantity: 3, price: 7500 },
        ],
        subtotal: 22500,
        shipping: 2500,
        total: 25000,
        status: "cancelado" as OrderStatus,
        paymentMethod: "card_credit",
        shippingMethod: "delivery",
        address: "Av. Santa Fe 5678, Buenos Aires",
        date: "2024-01-14T16:45:00",
    },
};

const statusConfig = {
    pendiente: { label: "Pendiente", icon: Clock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    procesando: { label: "Procesando", icon: Package, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    enviado: { label: "Enviado", icon: Truck, color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    entregado: { label: "Entregado", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
    cancelado: { label: "Cancelado", icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function AdminOrderDetail() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<typeof orderData[keyof typeof orderData] | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const order = orderData[orderId as keyof typeof orderData];
        if (order) {
            setOrder(order);
        }
        setLoading(false);
    }, [orderId]);

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (order) {
            setOrder({ ...order, status: newStatus });
        }
    };

    const handleSave = () => {
        setSaving(true);
        // In a real app, this would save to a database
        setTimeout(() => {
            setSaving(false);
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-white/20 border-t-burgundy rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-white/40">Pedido no encontrado</p>
            </div>
        );
    }

    const status = statusConfig[order.status];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/admin/pedidos")}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-cronde text-white">Pedido {order.id}</h1>
                    <p className="text-white/40 mt-1">
                        {new Date(order.date).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Estado del Pedido</h2>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleStatusChange(key as OrderStatus)}
                                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors ${
                                        order.status === key
                                            ? config.color
                                            : "bg-white/5 text-white/40 hover:text-white border border-white/10"
                                    }`}
                                >
                                    <config.icon size={16} />
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Productos</h2>
                        <div className="space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden">
                                            <img 
                                                src="/images/bombones.png" 
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-white/40 text-sm">Cantidad: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="text-burgundy font-medium">
                                        ${item.price.toLocaleString("es-AR")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Información del Cliente</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Nombre</p>
                                <p className="text-white">{order.customer.name}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Email</p>
                                <p className="text-white">{order.customer.email}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                                <p className="text-white">{order.customer.phone}</p>
                            </div>
                            <div>
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Método de Pago</p>
                                <p className="text-white capitalize">{order.paymentMethod}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Envío</h2>
                        <div className="flex items-start gap-4">
                            {order.shippingMethod === "pickup" ? (
                                <MapPin className="text-burgundy mt-1" size={24} />
                            ) : (
                                <Truck className="text-burgundy mt-1" size={24} />
                            )}
                            <div>
                                <p className="text-white font-medium">
                                    {order.shippingMethod === "pickup" ? "Retiro en Local" : "Envío a Domicilio"}
                                </p>
                                <p className="text-white/60">{order.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-cronde text-white mb-4">Resumen</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-white/60">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toLocaleString("es-AR")}</span>
                            </div>
                            <div className="flex justify-between text-white/60">
                                <span>Envío</span>
                                <span>{order.shipping === 0 ? "Gratis" : `$${order.shipping.toLocaleString("es-AR")}`}</span>
                            </div>
                            <div className="border-t border-white/10 pt-3 flex justify-between text-lg">
                                <span className="text-white">Total</span>
                                <span className="text-burgundy font-cronde">${order.total.toLocaleString("es-AR")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-burgundy text-black py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
