"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";

type OrderStatus = "pendiente" | "procesando" | "enviado" | "entregado" | "cancelado";

// Mock orders data
const orders = [
    {
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
    {
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
    {
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
    {
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
];

const statusConfig = {
    pendiente: { label: "Pendiente", icon: Clock, color: "bg-yellow-500/20 text-yellow-400" },
    procesando: { label: "Procesando", icon: Package, color: "bg-blue-500/20 text-blue-400" },
    enviado: { label: "Enviado", icon: Truck, color: "bg-purple-500/20 text-purple-400" },
    entregado: { label: "Entregado", icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
    cancelado: { label: "Cancelado", icon: XCircle, color: "bg-red-500/20 text-red-400" },
};

export default function AdminOrders() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusFilters = [
        { id: "all", name: "Todos" },
        { id: "pendiente", name: "Pendientes" },
        { id: "procesando", name: "Procesando" },
        { id: "enviado", name: "Enviados" },
        { id: "entregado", name: "Entregados" },
        { id: "cancelado", name: "Cancelados" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-cronde text-white">Pedidos</h1>
                <p className="text-white/40 mt-1">Gestiona los pedidos de la tienda</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por ID o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:border-burgundy focus:outline-none transition-colors"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {statusFilters.map((status) => (
                        <button
                            key={status.id}
                            onClick={() => setStatusFilter(status.id)}
                            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
                                statusFilter === status.id
                                    ? "bg-burgundy text-black"
                                    : "bg-white/5 text-white/60 hover:text-white border border-white/10"
                            }`}
                        >
                            {status.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => {
                    const status = statusConfig[order.status];
                    return (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {/* Order Header */}
                            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-white font-cronde text-xl">{order.id}</p>
                                        <p className="text-white/40 text-sm">{new Date(order.date).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${status.color}`}>
                                        <status.icon size={16} />
                                        {status.label}
                                    </span>
                                    <Link
                                        href={`/admin/pedidos/${order.id}`}
                                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Eye size={20} className="text-white/60" />
                                    </Link>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Customer */}
                                    <div>
                                        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Cliente</h3>
                                        <p className="text-white font-medium">{order.customer.name}</p>
                                        <p className="text-white/60 text-sm">{order.customer.email}</p>
                                        <p className="text-white/60 text-sm">{order.customer.phone}</p>
                                    </div>

                                    {/* Items */}
                                    <div>
                                        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Productos</h3>
                                        <div className="space-y-1">
                                            {order.items.map((item, idx) => (
                                                <p key={idx} className="text-white/80 text-sm">
                                                    {item.quantity}x {item.name}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div>
                                        <h3 className="text-white/40 text-xs uppercase tracking-wider mb-2">Total</h3>
                                        <p className="text-burgundy font-cronde text-xl">
                                            ${order.total.toLocaleString("es-AR")}
                                        </p>
                                        <p className="text-white/40 text-xs">
                                            {order.shippingMethod === "pickup" ? "Retiro en local" : `Envío: $${order.shipping.toLocaleString("es-AR")}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                    <Package size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No se encontraron pedidos</p>
                </div>
            )}
        </div>
    );
}
