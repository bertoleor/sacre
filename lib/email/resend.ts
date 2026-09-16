import { Resend } from "resend";

/**
 * TEST MODE: sandbox sender. Real test sends go only to `delivered@resend.dev`.
 * Override with EMAIL_FROM once a domain is verified (out of scope for now).
 */
export const EMAIL_FROM =
    process.env.EMAIL_FROM ?? "SACRÉ <onboarding@resend.dev>";
export const EMAIL_REPLY_TO = "hola@sacre.com.ar";

/** Sandbox-only recipient for real delivery tests. */
export const TEST_RECIPIENT = "delivered@resend.dev";

const BRAND = {
    background: "#050505",
    card: "#1a1a1a",
    burgundy: "#722F37",
    cream: "#f5f0e6",
    muted: "#a8a29e",
} as const;

let cachedClient: Resend | null = null;

/** Lazy singleton: only builds the client when an API key is configured. */
export function getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    if (!cachedClient) cachedClient = new Resend(apiKey);
    return cachedClient;
}

/** Test hook: drops the cached client so env changes take effect. */
export function resetResendClient(): void {
    cachedClient = null;
}

export interface OrderEmailItem {
    name: string;
    quantity: number;
    price: number;
}

export interface SendOrderConfirmationInput {
    to: string;
    orderNumber: string;
    total: number;
    items?: OrderEmailItem[];
    paymentUrl?: string | null;
    customerName?: string;
}

export interface SendOrderStatusInput {
    to: string;
    orderNumber: string;
    paymentStatus: string;
}

export interface SendEmailResult {
    /** True when skipped (no API key). Never throws: API errors are logged. */
    skipped: boolean;
    id: string | null;
}

export interface SendOptions {
    idempotencyKey?: string;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatPriceARS(value: number): string {
    return `$${value.toLocaleString("es-AR")}`;
}

function shell(title: string, preheader: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:Arial,Helvetica,sans-serif;color:${BRAND.cream};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.background};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.card};border-radius:16px;overflow:hidden;">
<tr><td style="background-color:${BRAND.burgundy};padding:24px 32px;text-align:center;">
<span style="font-size:28px;letter-spacing:8px;color:#ffffff;">SACRÉ</span>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 8px;font-size:24px;color:${BRAND.cream};">${title}</h1>
${body}
<hr style="border:none;border-top:1px solid #333333;margin:24px 0;">
<p style="margin:0;font-size:12px;color:${BRAND.muted};">Si tenés dudas, escribinos a <a href="mailto:${EMAIL_REPLY_TO}" style="color:${BRAND.cream};">${EMAIL_REPLY_TO}</a>.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function itemsTable(items: OrderEmailItem[]): string {
    if (items.length === 0) return "";
    const rows = items
        .map(
            (item) => `<tr>
<td style="padding:8px 0;font-size:14px;color:${BRAND.cream};">${escapeHtml(item.name)} × ${item.quantity}</td>
<td align="right" style="padding:8px 0;font-size:14px;color:${BRAND.cream};">${formatPriceARS(item.price * item.quantity)}</td>
</tr>`
        )
        .join("");
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid #333333;">${rows}</table>`;
}

export function buildOrderConfirmationHtml(input: SendOrderConfirmationInput): string {
    const greeting = input.customerName
        ? `<p style="font-size:15px;color:${BRAND.cream};">Hola ${escapeHtml(input.customerName)}, ¡gracias por tu compra!</p>`
        : `<p style="font-size:15px;color:${BRAND.cream};">¡Gracias por tu compra!</p>`;
    const payButton = input.paymentUrl
        ? `<p style="margin:24px 0;"><a href="${escapeHtml(input.paymentUrl)}" style="display:inline-block;background-color:${BRAND.burgundy};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;letter-spacing:2px;">PAGAR CON MERCADOPAGO</a></p>`
        : `<p style="font-size:14px;color:${BRAND.muted};">Te avisamos por este medio cuando tu pago se acredite y tu pedido entre en preparación.</p>`;
    const body = `${greeting}
<p style="font-size:14px;color:${BRAND.muted};">Tu número de pedido es:</p>
<p style="font-size:22px;letter-spacing:1px;color:${BRAND.cream};margin:0 0 8px;"><strong>${escapeHtml(input.orderNumber)}</strong></p>
${itemsTable(input.items ?? [])}
<p style="font-size:16px;color:${BRAND.cream};">Total: <strong>${formatPriceARS(input.total)}</strong></p>
${payButton}`;
    return shell(
        "¡Pedido confirmado!",
        `Tu pedido ${input.orderNumber} fue recibido.`,
        body
    );
}

export function buildOrderStatusHtml(input: SendOrderStatusInput): string {
    const approved = input.paymentStatus === "approved";
    const title = approved ? "¡Pago acreditado!" : "Actualización de tu pedido";
    const detail = approved
        ? "Nos pusimos a preparar tu pedido. Te avisamos cuando esté listo para entrega o retiro."
        : `El estado actual de tu pago es: <strong>${escapeHtml(input.paymentStatus)}</strong>. Si creés que es un error, respondé este mail y lo revisamos.`;
    const body = `<p style="font-size:15px;color:${BRAND.cream};">${detail}</p>
<p style="font-size:14px;color:${BRAND.muted};">Pedido: <strong style="color:${BRAND.cream};">${escapeHtml(input.orderNumber)}</strong></p>`;
    return shell(
        title,
        approved
            ? `Tu pago del pedido ${input.orderNumber} fue aprobado.`
            : `Novedades sobre tu pedido ${input.orderNumber}.`,
        body
    );
}

function defaultConfirmationKey(orderNumber: string): string {
    return `order-confirmation/${orderNumber}`.slice(0, 256);
}

function defaultStatusKey(orderNumber: string, paymentStatus: string): string {
    return `payment-${paymentStatus}/${orderNumber}`.slice(0, 256);
}

async function deliver(
    payload: { to: string; subject: string; html: string },
    idempotencyKey: string
): Promise<SendEmailResult> {
    const client = getResendClient();
    if (!client) return { skipped: true, id: null };
    try {
        const { data, error } = await client.emails.send(
            { from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO, ...payload },
            { idempotencyKey }
        );
        if (error) {
            console.error("Resend send error:", error.message);
            return { skipped: false, id: null };
        }
        return { skipped: false, id: data?.id ?? null };
    } catch (err) {
        console.error("Resend send error:", err);
        return { skipped: false, id: null };
    }
}

/** Confirmation email for a newly created order. Never throws. */
export function sendOrderConfirmation(
    input: SendOrderConfirmationInput,
    options?: SendOptions
): Promise<SendEmailResult> {
    return deliver(
        {
            to: input.to,
            subject: `Confirmación de tu pedido ${input.orderNumber}`,
            html: buildOrderConfirmationHtml(input),
        },
        options?.idempotencyKey ?? defaultConfirmationKey(input.orderNumber)
    );
}

/** Payment/order status update email (approved, rejected, ...). Never throws. */
export function sendOrderStatus(
    input: SendOrderStatusInput,
    options?: SendOptions
): Promise<SendEmailResult> {
    const approved = input.paymentStatus === "approved";
    return deliver(
        {
            to: input.to,
            subject: approved
                ? `¡Pago aprobado! Tu pedido ${input.orderNumber} está en camino`
                : `Actualización de tu pago ${input.orderNumber}`,
            html: buildOrderStatusHtml(input),
        },
        options?.idempotencyKey ?? defaultStatusKey(input.orderNumber, input.paymentStatus)
    );
}
