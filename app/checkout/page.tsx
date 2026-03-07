"use client";

import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/supabase/types";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, ArrowRight, Check, MapPin, Truck, Store, CreditCard, 
  Landmark, Lock, ShoppingBag, Loader2 
} from "lucide-react";

type CheckoutStep = "customer" | "shipping" | "payment" | "confirmation";

interface CheckoutState {
  step: CheckoutStep;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  shipping: { method: "delivery" | "pickup"; addressLine1: string; city: string; state: string; postalCode: string };
  paymentMethod: "mercadopago" | "transfer" | "card_debit" | "card_credit" | null;
  isProcessing: boolean;
  orderId: string | null;
}

export default function CheckoutPage() {
  const { items, getSubtotal, getShippingCost, getTotal, clearCart } = useCart();
  const [state, setState] = useState<CheckoutState>({
    step: "customer",
    customer: { firstName: "", lastName: "", email: "", phone: "" },
    shipping: { method: "delivery", addressLine1: "", city: "", state: "", postalCode: "" },
    paymentMethod: null,
    isProcessing: false,
    orderId: null,
  });

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  const isCustomerValid = () => {
    const { firstName, lastName, email, phone } = state.customer;
    return firstName && lastName && email && phone && email.includes("@");
  };

  const isShippingValid = () => {
    if (state.shipping.method === "pickup") return true;
    return state.shipping.addressLine1 && state.shipping.city && state.shipping.state && state.shipping.postalCode;
  };

  const isPaymentValid = () => state.paymentMethod !== null;

  const handleCustomerSubmit = () => {
    if (isCustomerValid()) setState(prev => ({ ...prev, step: "shipping" }));
  };

  const handleShippingSubmit = () => {
    if (isShippingValid()) setState(prev => ({ ...prev, step: "payment" }));
  };

  const handlePaymentSubmit = async () => {
    if (!isPaymentValid() || !state.paymentMethod) return;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const orderData = {
        order_number: `SACRE-${Date.now()}`,
        customer: state.customer,
        shipping: state.shipping,
        payment_method: state.paymentMethod,
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.price })),
        subtotal, shipping_cost: shippingCost, total,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Error al crear pedido");

      const result = await response.json();

      if (state.paymentMethod === "mercadopago" && result.paymentUrl) {
        globalThis.location.href = result.paymentUrl;
        return;
      }

      setState(prev => ({ ...prev, step: "confirmation", orderId: result.orderId, isProcessing: false }));
      clearCart();
    } catch (error) {
      console.error(error);
      alert("Error al procesar. Intentalo de nuevo.");
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const goBack = () => {
    const steps: CheckoutStep[] = ["customer", "shipping", "payment"];
    const idx = steps.indexOf(state.step);
    if (idx > 0) setState(prev => ({ ...prev, step: steps[idx - 1] }));
  };

  if (items.length === 0 && state.step !== "confirmation") {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-white/20" />
          <h1 className="font-cronde text-3xl mb-4">Tu carrito está vacío</h1>
          <Link href="/productos" className="inline-block px-8 py-3 bg-burgundy text-black rounded-full uppercase tracking-widest text-xs">
            Ver Productos
          </Link>
        </div>
      </main>
    );
  }

  if (state.step === "confirmation") {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-burgundy/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-burgundy" size={40} />
          </div>
          <h1 className="font-cronde text-4xl mb-4">¡Pedido Confirmado!</h1>
          <p className="text-white/60 mb-2">Tu número de pedido es:</p>
          <p className="font-cronde text-2xl text-burgundy mb-8">{state.orderId}</p>
          <Link href="/productos" className="inline-block px-8 py-3 border border-white/20 rounded-full uppercase tracking-widest text-xs hover:bg-white hover:text-black">
            Volver a la Tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <Link href="/productos" className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} /> <span className="uppercase tracking-widest text-xs">Seguir Comprando</span>
          </Link>
          <h1 className="font-cronde text-3xl md:text-4xl">Checkout</h1>
          <div className="flex items-center gap-2 text-white/40"><Lock size={16} /><span className="text-xs">Compra Segura</span></div>
        </div>

        <div className="flex items-center justify-center mb-12">
          {(["customer", "shipping", "payment"] as CheckoutStep[]).map((step, idx) => {
              const currentStepIndex = ["customer", "shipping", "payment"].indexOf(state.step);
              const getStepStyle = (stepName: string, index: number) => {
                if (state.step === stepName) return "bg-burgundy text-black";
                if (currentStepIndex > index) return "bg-white/20";
                return "bg-white/5 text-white/40";
              };
              const getLineStyle = (index: number) => {
                if (currentStepIndex > index) return "bg-burgundy";
                return "bg-white/10";
              };
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${getStepStyle(step, idx)}`}>
                    {currentStepIndex > idx ? <Check size={16} /> : idx + 1}
                  </div>
                  {step !== "payment" && (
                    <div className={`w-16 md:w-24 h-0.5 ${getLineStyle(idx)}`} />
                  )}
                </div>
              );
            })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {state.step === "customer" && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                  <h2 className="font-cronde text-2xl mb-6">1. Datos Personales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-xs uppercase tracking-widest text-white/50">Nombre</label>
                      <input id="firstName" type="text" value={state.customer.firstName} onChange={e => setState(prev => ({ ...prev, customer: { ...prev.customer, firstName: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-xs uppercase tracking-widest text-white/50">Apellido</label>
                      <input id="lastName" type="text" value={state.customer.lastName} onChange={e => setState(prev => ({ ...prev, customer: { ...prev.customer, lastName: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="Tu apellido" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-xs uppercase tracking-widest text-white/50">Email</label>
                      <input id="email" type="email" value={state.customer.email} onChange={e => setState(prev => ({ ...prev, customer: { ...prev.customer, email: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="tu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-xs uppercase tracking-widest text-white/50">Teléfono</label>
                      <input id="phone" type="tel" value={state.customer.phone} onChange={e => setState(prev => ({ ...prev, customer: { ...prev.customer, phone: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="11 1234 5678" />
                    </div>
                  </div>
                </div>
                <button onClick={handleCustomerSubmit} disabled={!isCustomerValid()} className="w-full bg-burgundy text-black py-4 rounded-full uppercase tracking-widest text-xs hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            )}

            {state.step === "shipping" && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                  <h2 className="font-cronde text-2xl mb-6">2. Método de Entrega</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setState(prev => ({ ...prev, shipping: { ...prev.shipping, method: "delivery" } }))} className={`p-6 rounded-xl border text-left ${state.shipping.method === "delivery" ? "border-burgundy bg-burgundy/10" : "border-white/10"}`}>
                      <Truck className={`mb-3 ${state.shipping.method === "delivery" ? "text-burgundy" : "text-white/40"}`} />
                      <h3 className="font-medium mb-1">Envío a Domicilio</h3>
                      <p className="text-xs text-white/40">Entrega en 3-5 días</p>
                    </button>
                    <button onClick={() => setState(prev => ({ ...prev, shipping: { ...prev.shipping, method: "pickup" } }))} className={`p-6 rounded-xl border text-left ${state.shipping.method === "pickup" ? "border-burgundy bg-burgundy/10" : "border-white/10"}`}>
                      <Store className={`mb-3 ${state.shipping.method === "pickup" ? "text-burgundy" : "text-white/40"}`} />
                      <h3 className="font-medium mb-1">Retiro en Local</h3>
                      <p className="text-xs text-white/40">Palermo, Buenos Aires</p>
                    </button>
                  </div>
                  {state.shipping.method === "delivery" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="address" className="text-xs uppercase tracking-widest text-white/50">Dirección</label>
                        <input id="address" type="text" value={state.shipping.addressLine1} onChange={e => setState(prev => ({ ...prev, shipping: { ...prev.shipping, addressLine1: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="Calle y número" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="city" className="text-xs uppercase tracking-widest text-white/50">Ciudad</label>
                        <input id="city" type="text" value={state.shipping.city} onChange={e => setState(prev => ({ ...prev, shipping: { ...prev.shipping, city: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="Ciudad" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="state" className="text-xs uppercase tracking-widest text-white/50">Provincia</label>
                        <input id="state" type="text" value={state.shipping.state} onChange={e => setState(prev => ({ ...prev, shipping: { ...prev.shipping, state: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="Provincia" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="postalCode" className="text-xs uppercase tracking-widest text-white/50">Código Postal</label>
                        <input id="postalCode" type="text" value={state.shipping.postalCode} onChange={e => setState(prev => ({ ...prev, shipping: { ...prev.shipping, postalCode: e.target.value } }))} className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 focus:border-burgundy outline-none" placeholder="CP" />
                      </div>
                    </div>
                  )}
                  {state.shipping.method === "pickup" && (
                    <div className="bg-burgundy/10 border border-burgundy/30 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <MapPin className="text-burgundy mt-1" size={24} />
                        <div>
                          <h3 className="font-medium mb-2">SACRÉ Atelier</h3>
                          <p className="text-sm text-white/60">Jorge Luis Borges 2100, Palermo<br />Buenos Aires, Argentina</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button onClick={goBack} className="px-8 py-3 border border-white/20 rounded-full uppercase tracking-widest text-xs">Volver</button>
                  <button onClick={handleShippingSubmit} disabled={!isShippingValid()} className="flex-1 bg-burgundy text-black py-4 rounded-full uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2">
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {state.step === "payment" && (
              <div className="space-y-8">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                  <h2 className="font-cronde text-2xl mb-6">3. Método de Pago</h2>
                  <div className="space-y-4">
                    {[
                      { id: "mercadopago", icon: CreditCard, label: "MercadoPago", desc: "Visa, Mastercard, Mercado Pago" },
                      { id: "transfer", icon: Landmark, label: "Transferencia", desc: "10% de descuento" },
                      { id: "card_debit", icon: CreditCard, label: "Débito", desc: "Visa Débito, Maestro" },
                      { id: "card_credit", icon: CreditCard, label: "Crédito", desc: "Visa, Mastercard - Hasta 12 cuotas" },
                    ].map(pm => (
                      <button key={pm.id} onClick={() => setState(prev => ({ ...prev, paymentMethod: pm.id as any }))} className={`w-full p-6 rounded-xl border text-left flex items-center gap-4 ${state.paymentMethod === pm.id ? "border-burgundy bg-burgundy/10" : "border-white/10"}`}>
                        <pm.icon className={state.paymentMethod === pm.id ? "text-burgundy" : "text-white/40"} />
                        <div><h3 className="font-medium mb-1">{pm.label}</h3><p className="text-xs text-white/40">{pm.desc}</p></div>
                        {state.paymentMethod === pm.id && <Check className="ml-auto text-burgundy" size={20} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={goBack} disabled={state.isProcessing} className="px-8 py-3 border border-white/20 rounded-full uppercase tracking-widest text-xs">Volver</button>
                  <button onClick={handlePaymentSubmit} disabled={!isPaymentValid() || state.isProcessing} className="flex-1 bg-burgundy text-black py-4 rounded-full uppercase tracking-widest text-xs disabled:opacity-50 flex items-center justify-center gap-2">
                    {state.isProcessing ? <><Loader2 size={16} className="animate-spin" /> Procesando...</> : <>Finalizar Compra <Lock size={16} /></>}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 bg-white/5 border border-white/10 rounded-[2rem] p-8">
              <h2 className="font-cronde text-2xl mb-6">Tu Pedido</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                      <Image src={item.product.images?.[0] || "/images/bombones.png"} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0"><h3 className="text-sm truncate">{item.product.name}</h3><p className="text-xs text-white/40">Cantidad: {item.quantity}</p></div>
                    <div className="text-sm">{formatPrice(item.product.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-white/60">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/60">Envío</span><span className={shippingCost === 0 ? "text-burgundy" : ""}>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between text-lg font-medium pt-3 border-t border-white/10"><span>Total</span><span className="text-burgundy">{formatPrice(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
