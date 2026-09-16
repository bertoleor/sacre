import { describe, it, expect, vi, beforeEach } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock("resend", () => ({
    Resend: vi.fn(function (this: unknown) {
        return { emails: { send: sendMock } };
    }),
}));

import {
    buildOrderConfirmationHtml,
    buildOrderStatusHtml,
    getResendClient,
    resetResendClient,
    sendOrderConfirmation,
    sendOrderStatus,
} from "./resend.ts";

const API_KEY = "re_test_key";

beforeEach(() => {
    sendMock.mockReset();
    resetResendClient();
    process.env.RESEND_API_KEY = API_KEY;
    delete process.env.EMAIL_FROM;
});

describe("buildOrderConfirmationHtml", () => {
    it("includes order number, total and items", () => {
        const html = buildOrderConfirmationHtml({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-123",
            total: 18000,
            items: [{ name: "Caja Selección", quantity: 2, price: 9000 }],
            customerName: "Ada Lovelace",
        });
        expect(html).toContain("SACRE-123");
        expect(html).toContain("Ada Lovelace");
        expect(html).toContain("Caja Selección");
        expect(html).toContain("#722F37");
    });

    it("renders a MercadoPago button only when paymentUrl is present", () => {
        const withUrl = buildOrderConfirmationHtml({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-1",
            total: 100,
            paymentUrl: "https://mp.example/pay",
        });
        const withoutUrl = buildOrderConfirmationHtml({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-1",
            total: 100,
        });
        expect(withUrl).toContain("https://mp.example/pay");
        expect(withoutUrl).not.toContain("PAGAR CON MERCADOPAGO");
    });

    it("escapes user-controlled HTML", () => {
        const html = buildOrderConfirmationHtml({
            to: "delivered@resend.dev",
            orderNumber: "<script>alert(1)</script>",
            total: 100,
            customerName: "<b>Ada</b>",
        });
        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt;script&gt;");
        expect(html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    });
});

describe("buildOrderStatusHtml", () => {
    it("approved copy differs from other statuses", () => {
        const approved = buildOrderStatusHtml({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-9",
            paymentStatus: "approved",
        });
        const rejected = buildOrderStatusHtml({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-9",
            paymentStatus: "rejected",
        });
        expect(approved).toContain("SACRE-9");
        expect(approved).toContain("Pago acreditado");
        expect(rejected).toContain("rejected");
        expect(rejected).not.toContain("Pago acreditado");
    });
});

describe("getResendClient", () => {
    it("returns null without an API key (lazy, no throw)", () => {
        delete process.env.RESEND_API_KEY;
        expect(getResendClient()).toBeNull();
    });

    it("builds a client when the key exists", () => {
        expect(getResendClient()).not.toBeNull();
    });
});

describe("sendOrderConfirmation", () => {
    it("skips silently without an API key", async () => {
        delete process.env.RESEND_API_KEY;
        const result = await sendOrderConfirmation({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-1",
            total: 100,
        });
        expect(result).toEqual({ skipped: true, id: null });
        expect(sendMock).not.toHaveBeenCalled();
    });

    it("sends with sandbox from and default idempotency key", async () => {
        sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
        const result = await sendOrderConfirmation({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-42",
            total: 25000,
        });
        expect(result).toEqual({ skipped: false, id: "email_1" });
        expect(sendMock).toHaveBeenCalledOnce();
        const [payload, options] = sendMock.mock.calls[0] as [
            { from: string; to: string; subject: string; html: string },
            { idempotencyKey: string },
        ];
        expect(payload.from).toContain("onboarding@resend.dev");
        expect(payload.to).toBe("delivered@resend.dev");
        expect(payload.subject).toContain("SACRE-42");
        expect(options.idempotencyKey).toBe("order-confirmation/SACRE-42");
    });

    it("honours a custom idempotency key", async () => {
        sendMock.mockResolvedValue({ data: { id: "email_2" }, error: null });
        await sendOrderConfirmation(
            { to: "delivered@resend.dev", orderNumber: "SACRE-7", total: 10 },
            { idempotencyKey: "custom/key-1" }
        );
        expect(sendMock.mock.calls[0][1]).toEqual({
            idempotencyKey: "custom/key-1",
        });
    });

    it("returns null id on API error without throwing", async () => {
        sendMock.mockResolvedValue({
            data: null,
            error: { message: "Forbidden" },
        });
        const result = await sendOrderConfirmation({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-3",
            total: 10,
        });
        expect(result).toEqual({ skipped: false, id: null });
    });

    it("returns null id on network throw without throwing", async () => {
        sendMock.mockRejectedValue(new Error("network down"));
        const result = await sendOrderConfirmation({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-4",
            total: 10,
        });
        expect(result).toEqual({ skipped: false, id: null });
    });
});

describe("sendOrderStatus", () => {
    it("uses approved subject for approved payments", async () => {
        sendMock.mockResolvedValue({ data: { id: "email_9" }, error: null });
        const result = await sendOrderStatus({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-9",
            paymentStatus: "approved",
        });
        expect(result).toEqual({ skipped: false, id: "email_9" });
        const [payload] = sendMock.mock.calls[0] as [
            { subject: string },
            { idempotencyKey: string },
        ];
        expect(payload.subject).toContain("Pago aprobado");
    });

    it("passes the default status idempotency key", async () => {
        sendMock.mockResolvedValue({ data: { id: "x" }, error: null });
        await sendOrderStatus({
            to: "delivered@resend.dev",
            orderNumber: "SACRE-9",
            paymentStatus: "rejected",
        });
        expect(sendMock.mock.calls[0][1]).toEqual({
            idempotencyKey: "payment-rejected/SACRE-9",
        });
    });
});
