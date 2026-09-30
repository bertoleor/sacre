/**
 * Respuesta de modo demo para /api/orders/create — SACRE P1-4.
 *
 * Se devuelve cuando Supabase no está configurado: el pedido NO se persiste
 * y NO corre el checkout de MercadoPago. Marcar explícitamente con `demo:true`
 * evita que quien consuma la API crea que el pedido quedó registrado.
 */
export interface DemoOrderResponse {
  success: true;
  orderId: string;
  demo: true;
  paymentUrl: null;
  message: string;
}

export function demoOrderResponse(orderId: string): DemoOrderResponse {
  return {
    success: true,
    orderId,
    demo: true,
    paymentUrl: null,
    message: "Pedido creado (modo demo - sin base de datos)",
  };
}
