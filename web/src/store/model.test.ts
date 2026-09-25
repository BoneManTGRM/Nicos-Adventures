import { describe, expect, it } from "vitest";
import { syntheticCatalog } from "../../test-fixtures/store";
import { readCatalog, createOrderRequest, formatPrice, MAX_QUANTITY } from "./model";

const selection = { productId: "test-only-block", variantId: "blue", quantity: 2 };
const request = (input = syntheticCatalog(), overrides = {}) => createOrderRequest(readCatalog(input), { ...selection, ...overrides }, "en", true, true);

describe("public store catalog", () => {
  it("preserves a complete approved listing without unknown/private fields", () => {
    const raw = syntheticCatalog();
    const catalog = readCatalog({ ...raw, privateNote: "PRIVATE_SENTINEL", profiles: [{ playerName: "CHILD_SENTINEL" }] });
    expect(catalog.products).toHaveLength(1);
    expect(catalog.salesEnabled).toBe(true);
    expect(JSON.stringify(catalog)).not.toMatch(/PRIVATE_SENTINEL|CHILD_SENTINEL|profiles/);
  });
  it("does not publish drafts, even when their other fields are complete", () => {
    const raw = syntheticCatalog(); raw.products[0].publication = "draft";
    expect(readCatalog(raw).products).toEqual([]);
  });
  it.each(["actualProduct", "publicApproved"])("rejects a photo without %s", flag => {
    const raw = syntheticCatalog(); Object.assign(raw.products[0].photos[0], { [flag]: false });
    expect(readCatalog(raw).products).toEqual([]);
  });
  it.each(["https://tracker.invalid/p.webp", "/store-images/../private.webp", "/store-images/a.webp?q=child", "data:image/png,a"])("rejects unsafe image path %s", src => {
    const raw = syntheticCatalog(); raw.products[0].photos[0].src = src;
    expect(readCatalog(raw).products).toEqual([]);
  });
  it("leaves incomplete optional details null and prevents ordering", () => {
    const raw = syntheticCatalog(); Object.assign(raw.products[0], { care: null, material: undefined, price: null });
    const parsed = readCatalog(raw);
    expect(parsed.products).toHaveLength(1);
    expect(parsed.products[0].care).toBeNull();
    expect(request(raw)).toBeNull();
  });
  it("requires both translations for a published name", () => {
    const raw = syntheticCatalog(); raw.products[0].name["es-MX"] = "";
    expect(readCatalog(raw).products).toEqual([]);
  });
  it("rejects unsupported schema and duplicate published identifiers", () => {
    expect(() => readCatalog({ version: 99 })).toThrow();
    const raw = syntheticCatalog(); raw.products.push(structuredClone(raw.products[0]));
    expect(() => readCatalog(raw)).toThrow();
  });
  it.each([NaN, -100, 0, 12.5, Number.MAX_SAFE_INTEGER])("does not invent a price for invalid minor amount %s", minor => {
    const raw = syntheticCatalog(); raw.products[0].price.minor = minor;
    expect(readCatalog(raw).products[0].price).toBeNull(); expect(request(raw)).toBeNull();
  });
  it.each(["", "XXX", "not-money"])("rejects unsupported/unspecified currency %s", currency => {
    const raw = syntheticCatalog(); raw.products[0].price.currency = currency;
    expect(request(raw)).toBeNull();
  });
  it("excludes seller details that are not approved for public use", () => {
    const raw = syntheticCatalog(); raw.seller.publicApproved = false;
    const parsed = readCatalog(raw); expect(parsed.seller).toBeNull(); expect(parsed.salesEnabled).toBe(false);
  });
  it("rejects duplicate variant IDs rather than silently selecting the wrong item", () => {
    const raw = syntheticCatalog(); raw.products[0].variants.push(structuredClone(raw.products[0].variants[0]));
    expect(readCatalog(raw).products).toEqual([]);
  });
});

describe("adult order requests, never payments", () => {
  it("uses canonical product/variant/quantity and the approved email only", () => {
    const value = request(); expect(value).not.toBeNull();
    const url = new URL(value!.href);
    expect(url.protocol).toBe("mailto:"); expect(url.pathname).toBe("orders@example.invalid");
    expect(url.searchParams.get("body")).toContain("Quantity: 2");
    expect(value!.text).toContain("Test blue"); expect(value!.text).toContain("MXN");
    expect(value!.text).toContain("not a confirmed order or payment");
  });
  it("does not use injected amount, child data, customer data, or arbitrary checkout URLs", () => {
    const raw = syntheticCatalog(); Object.assign(raw.products[0], { checkoutUrl: "javascript:alert(1)", privateNote: "PRIVATE_SENTINEL" });
    const value = request(raw, { quantity: 2, amount: 1, playerName: "CHILD_SENTINEL", address: "ADDRESS_SENTINEL" });
    expect(value!.text).not.toMatch(/SENTINEL|javascript/); expect(value!.text).toContain("299");
  });
  it("provides a Spanish request and correct non-two-decimal currency arithmetic", () => {
    const raw = syntheticCatalog(); raw.products[0].price = { minor: 100, currency: "JPY" };
    const value = createOrderRequest(readCatalog(raw), selection, "es-MX", true, true);
    expect(value!.text).toContain("Cantidad: 2"); expect(value!.text).toContain("200");
    expect(value!.text).toContain("no es un pedido ni un pago confirmado");
    expect(formatPrice({ minor: 1234, currency: "KWD" }, "en")).toContain("1.234");
  });
  it.each([0, -1, 1.5, MAX_QUANTITY + 1, NaN, Infinity])("blocks invalid quantity %s", quantity => expect(request(undefined, { quantity })).toBeNull());
  it.each(["red", "unknown", ""])("blocks unavailable or missing variant %s", variantId => expect(request(undefined, { variantId })).toBeNull());
  it("supports a product with no variants without inventing a variant", () => {
    const raw = syntheticCatalog(); raw.products[0].variants = [];
    expect(request(raw, { variantId: "" })).not.toBeNull();
    expect(request(raw, { variantId: "blue" })).toBeNull();
  });
  it.each(["sold-out", "unavailable"])("blocks %s products", availability => {
    const raw = syntheticCatalog(); raw.products[0].availability = availability; expect(request(raw)).toBeNull();
  });
  it("permits approved made-to-order products and includes preparation/fulfillment", () => {
    const raw = syntheticCatalog(); raw.products[0].availability = "made-to-order";
    expect(request(raw)!.text).toContain("TEST PREPARATION"); expect(request(raw)!.text).toContain("TEST FULFILLMENT");
  });
  it.each(["commercialRights", "safetyReview", "fulfillment"])("blocks missing product approval %s", flag => {
    const raw = syntheticCatalog(); Object.assign(raw.products[0].approvals, { [flag]: false }); expect(request(raw)).toBeNull();
  });
  it.each(["adultManaged", "marketReviewApproved"])("blocks missing seller approval %s", flag => {
    const raw = syntheticCatalog(); Object.assign(raw.seller, { [flag]: false }); expect(request(raw)).toBeNull();
  });
  it("blocks disabled store, disabled product, offline and no adult acknowledgement", () => {
    const raw = syntheticCatalog(); raw.salesEnabled = false; expect(request(raw)).toBeNull();
    raw.salesEnabled = true; raw.products[0].saleEnabled = false; expect(request(raw)).toBeNull();
    raw.products[0].saleEnabled = true; const catalog = readCatalog(raw);
    expect(createOrderRequest(catalog, selection, "en", false, true)).toBeNull();
    expect(createOrderRequest(catalog, selection, "en", true, false)).toBeNull();
  });
  it.each(["bad@host\r\nBcc:other@host.com", "a@example.com,b@example.com", "a@example.com?bcc=other@example.com", "not-email"])("blocks invalid email %s", value => {
    const raw = syntheticCatalog(); raw.seller.contact.value = value; expect(request(raw)).toBeNull();
  });
  it("constructs a fixed WhatsApp destination and rejects unsupported protocols", () => {
    const raw = syntheticCatalog(); raw.seller.contact = { kind: "whatsapp", value: "15555550100", publicApproved: true };
    const value = request(raw); expect(new URL(value!.href).hostname).toBe("wa.me");
    expect(new URL(value!.href).pathname).toBe("/15555550100");
    raw.seller.contact.value = "1555?x=1"; expect(request(raw)).toBeNull();
    raw.seller.contact.kind = "checkout"; expect(request(raw)).toBeNull();
  });
});
