import { describe, expect, it } from "vitest";
import { syntheticCatalog } from "../../test-fixtures/store";
import { readCatalog, createOrderRequest } from "./model";
const selection = { productId: "test-only-block", variantId: "blue", quantity: 2 };
const request = (input = syntheticCatalog()) => createOrderRequest(readCatalog(input), selection, "en", true, true);
describe("business email recipient regressions", () => {
  it("encodes reserved characters without losing the recipient or message", () => {
    const raw = syntheticCatalog(); raw.seller.contact.value = "orders#shop+toys@example.invalid";
    const value = request(raw); expect(value).not.toBeNull();
    const url = new URL(value!.href);
    expect(url.hash).toBe("");
    expect(decodeURIComponent(url.pathname)).toBe(raw.seller.contact.value);
    expect(url.searchParams.get("body")).toContain("Quantity: 2");
  });
  it.each([".orders@example.com", "orders.@example.com", "a..b@example.com", "a@host..com", "a@-host.com", "a@host-.com"])("rejects malformed business recipient %s", value => {
    const raw = syntheticCatalog(); raw.seller.contact.value = value; expect(request(raw)).toBeNull();
  });
});
