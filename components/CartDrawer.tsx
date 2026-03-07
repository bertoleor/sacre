"use client";

import { useCart, FREE_SHIPPING_THRESHOLD_VALUE } from "@/lib/context/CartContext";
import { formatPrice } from "@/lib/supabase/types";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    isLoading,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getTotal,
    getItemCount,
  } = useCart();

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();
  const itemCount = getItemCount();
  const distanceToFreeShipping = FREE_SHIPPING_THRESHOLD_VALUE - subtotal;

  const isEmpty = !isLoading && items.length === 0;
  const hasItems = !isLoading && items.length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity cursor-default"
        onClick={closeCart}
        aria-label="Cerrar carrito"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#050505]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-burgundy" size={24} />
              <h2 className="font-cronde text-2xl">Carrito</h2>
              {itemCount > 0 && (
                <span className="bg-burgundy text-black text-xs font-bold px-2 py-1 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <button 
              onClick={closeCart}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {itemCount > 0 && distanceToFreeShipping > 0 && (
            <div className="px-6 py-4 bg-white/5 mx-6 mt-4 rounded-xl">
              <p className="text-xs text-white/60 mb-2">
                Comprá ${formatPrice(distanceToFreeShipping)} más para envío gratis
              </p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-burgundy transition-all duration-300"
                  style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD_VALUE) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {itemCount > 0 && distanceToFreeShipping <= 0 && (
            <div className="px-6 py-4 bg-burgundy/20 mx-6 mt-4 rounded-xl">
              <p className="text-burgundy text-sm font-medium">
                🎉 ¡Envío gratis incluido!
              </p>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-white/20 border-t-burgundy rounded-full animate-spin" />
              </div>
            )}
            
            {isEmpty && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-white/20 mb-4" />
                <p className="text-white/60 mb-2">Tu carrito está vacío</p>
                <p className="text-white/40 text-sm">Agregá nuestros productos</p>
              </div>
            )}
            
            {hasItems && (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/10">
                    <Image
                      src={item.product.images?.[0] || '/images/bombones.png'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{item.product.name}</h3>
                    <p className="text-burgundy text-sm">
                      {formatPrice(item.product.price)}
                    </p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-white/10 rounded-full">
                        <button
                          onClick={() => updateQuantity(String(item.product.id), item.quantity - 1)}
                          className="p-1 hover:text-burgundy transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(String(item.product.id), item.quantity + 1)}
                          className="p-1 hover:text-burgundy transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(String(item.product.id))}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Totals */}
          {itemCount > 0 && (
            <div className="border-t border-white/10 p-6 space-y-4 bg-black/20">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Envío</span>
                <span className={shippingCost === 0 ? "text-burgundy" : ""}>
                  {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                </span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-burgundy">{formatPrice(total)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex items-center justify-center gap-2 w-full bg-burgundy text-black py-4 rounded-full uppercase tracking-widest text-xs hover:bg-white transition-colors"
              >
                Finalizar Compra
                <ArrowRight size={16} />
              </Link>

              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-center text-white/60 text-sm hover:text-white transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
