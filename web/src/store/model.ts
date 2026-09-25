import type { Catalog, Localized, OrderRequest, Photo, Price, Product, Selection, Seller, StoreLanguage, Variant } from "./types";

/** A request-size limit, not an inventory or production-capacity claim. */
export const MAX_QUANTITY = 10;
const currencies = new Set(Intl.supportedValuesOf("currency"));
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const string = (value: unknown, limit = 2000): string | null => typeof value === "string" && value.trim().length > 0 && value.length <= limit && !/[\u0000-\u0008\u000b-\u001f\u007f]/.test(value) ? value.trim() : null;
const identifier = (value: unknown): string | null => typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value) ? value : null;
const positiveInteger = (value: unknown, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= max;
function localized(value: unknown): Localized | null {
  const raw = object(value), en = string(raw.en), es = string(raw["es-MX"]);
  return en && es ? { en, "es-MX": es } : null;
}
function price(value: unknown): Price | null {
  const raw = object(value);
  return positiveInteger(raw.minor, 1_000_000_000) && typeof raw.currency === "string" && currencies.has(raw.currency)
    ? { minor: raw.minor, currency: raw.currency } : null;
}
function photo(value: unknown): Photo | null {
  const raw = object(value), alt = localized(raw.alt);
  return raw.actualProduct === true && raw.publicApproved === true && alt
    && typeof raw.src === "string" && /^\/store-images\/[a-z0-9][a-z0-9-]{0,80}\.webp$/.test(raw.src)
    && positiveInteger(raw.width, 1600) && positiveInteger(raw.height, 1600)
    ? { src: raw.src, alt, width: raw.width, height: raw.height, actualProduct: true, publicApproved: true } : null;
}
function variant(value: unknown): Variant | null {
  const raw = object(value), id = identifier(raw.id), label = localized(raw.label);
  return id && label && typeof raw.available === "boolean" ? { id, label, available: raw.available } : null;
}
function product(value: unknown): Product | null {
  const raw = object(value), approvals = object(raw.approvals);
  // Draft fields are never projected, including their image names or private notes.
  if (raw.publication !== "published" || approvals.listing !== true) return null;
  const id = identifier(raw.id), name = localized(raw.name), description = localized(raw.description);
  if (!id || !name || !description || !Array.isArray(raw.photos) || raw.photos.length < 1 || raw.photos.length > 6) return null;
  const photos = raw.photos.map(photo);
  if (photos.some(item => item === null)) return null;
  const variants = Array.isArray(raw.variants) && raw.variants.length <= 30 ? raw.variants.map(variant) : [];
  if ((raw.variants != null && !Array.isArray(raw.variants)) || (Array.isArray(raw.variants) && raw.variants.length > 30)
    || variants.some(item => item === null) || new Set(variants.map(item => item?.id)).size !== variants.length) return null;
  const availability = raw.availability === "in-stock" || raw.availability === "made-to-order" || raw.availability === "sold-out" ? raw.availability : "unavailable";
  return {
    id, publication: "published", name, description, photos: photos as Photo[], price: price(raw.price), variants: variants as Variant[], availability,
    dimensions: localized(raw.dimensions), material: localized(raw.material), care: localized(raw.care), preparation: localized(raw.preparation),
    fulfillment: localized(raw.fulfillment), safety: localized(raw.safety), saleEnabled: raw.saleEnabled === true,
    approvals: { listing: true, commercialRights: approvals.commercialRights === true, safetyReview: approvals.safetyReview === true, fulfillment: approvals.fulfillment === true },
  };
}
function seller(value: unknown): Seller | null {
  const raw = object(value), contact = object(raw.contact), displayName = string(raw.displayName, 120);
  if (raw.publicApproved !== true || raw.adultManaged !== true || raw.marketReviewApproved !== true || !displayName || contact.publicApproved !== true) return null;
  const destination = string(contact.value, 254);
  if (!destination || destination !== contact.value) return null;
  // Fixed protocols: source data can never inject an arbitrary checkout/redirect URL.
  const validEmail = contact.kind === "email" && /^[a-zA-Z0-9.!#$'*+\/_=-]+@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(destination);
  const validPhone = contact.kind === "whatsapp" && /^[1-9][0-9]{7,14}$/.test(destination);
  if (!validEmail && !validPhone) return null;
  const territory = localized(raw.territory), delivery = localized(raw.delivery), returns = localized(raw.returns), privacy = localized(raw.privacy), information = localized(raw.information);
  if (!territory || !delivery || !returns || !privacy || !information) return null;
  return {
    publicApproved: true, adultManaged: true, marketReviewApproved: true, displayName,
    contact: { kind: validEmail ? "email" : "whatsapp", value: destination, publicApproved: true },
    territory, delivery, returns, privacy, information,
  };
}
/** Allowlist projection, shared by the build compiler and runtime validation.
 * Approval flags record owner decisions; they are not independent legal certification.
 */
export function readCatalog(value: unknown): Catalog {
  const raw = object(value);
  if (raw.version !== 1 || !Array.isArray(raw.products) || raw.products.length > 100) throw new Error("Invalid store catalog schema");
  const products = raw.products.map(product).filter((item): item is Product => item !== null);
  if (new Set(products.map(item => item.id)).size !== products.length) throw new Error("Duplicate published product identifier");
  const approvedSeller = seller(raw.seller);
  return { version: 1, salesEnabled: raw.salesEnabled === true && approvedSeller !== null, seller: approvedSeller, products };
}
export function productCanBeRequested(item: Product): boolean {
  return item.saleEnabled && item.approvals.commercialRights && item.approvals.safetyReview && item.approvals.fulfillment
    && (item.availability === "in-stock" || item.availability === "made-to-order")
    && item.price !== null && item.dimensions !== null && item.material !== null && item.care !== null
    && item.preparation !== null && item.fulfillment !== null && item.safety !== null
    && (item.variants.length === 0 || item.variants.some(option => option.available));
}
export function formatPrice(value: Price, language: StoreLanguage, quantity = 1): string {
  const formatter = new Intl.NumberFormat(language === "en" ? "en-US" : "es-MX", { style: "currency", currency: value.currency, currencyDisplay: "code" });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format((value.minor * quantity) / 10 ** digits);
}
export function createOrderRequest(catalog: Catalog, selection: Selection, language: StoreLanguage, online: boolean, adult: boolean): OrderRequest | null {
  if (!online || !adult || !catalog.salesEnabled || !catalog.seller || !positiveInteger(selection.quantity, MAX_QUANTITY)) return null;
  const item = catalog.products.find(candidate => candidate.id === selection.productId);
  if (!item || !productCanBeRequested(item) || !item.price) return null;
  const chosen = item.variants.find(candidate => candidate.id === selection.variantId && candidate.available);
  if ((item.variants.length > 0 && !chosen) || (item.variants.length === 0 && selection.variantId !== "")) return null;
  const es = language === "es-MX";
  const lines = [
    es ? "Solicitud de información y pedido — La Tiendita de Nico" : "Order enquiry — Nico’s Toy Shop",
    `${es ? "Producto" : "Product"}: ${item.name[language]} (${item.id})`,
    ...(chosen ? [`${es ? "Opción" : "Option"}: ${chosen.label[language]} (${chosen.id})`] : []),
    `${es ? "Cantidad" : "Quantity"}: ${selection.quantity}`,
    `${es ? "Precio publicado por pieza" : "Listed unit price"}: ${formatPrice(item.price, language)}`,
    `${es ? "Subtotal de productos publicado" : "Listed item subtotal"}: ${formatPrice(item.price, language, selection.quantity)}`,
    `${es ? "Preparación" : "Preparation"}: ${item.preparation![language]}`,
    `${es ? "Entrega" : "Fulfillment"}: ${item.fulfillment![language]}`,
    "",
    es ? "Esta es una solicitud; no es un pedido ni un pago confirmado. Por favor confirma disponibilidad, entrega y el total final, incluidos los cargos o impuestos aplicables, antes de aceptar el pedido."
      : "This is a request, not a confirmed order or payment. Please confirm availability, delivery and the final total, including any applicable charges or taxes, before accepting the order.",
  ];
  const text = lines.join("\n"), contact = catalog.seller.contact;
  const href = contact.kind === "email"
    ? `mailto:${contact.value}?subject=${encodeURIComponent(es ? `Solicitud: ${item.id}` : `Enquiry: ${item.id}`)}&body=${encodeURIComponent(text)}`
    : `https://wa.me/${contact.value}?text=${encodeURIComponent(text)}`;
  return { href, text, contact: contact.value, channel: contact.kind };
}
