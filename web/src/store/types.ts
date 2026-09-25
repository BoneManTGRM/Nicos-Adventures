/** Store types intentionally have no dependency on child profiles or game state. */
export type StoreLanguage = "en" | "es-MX";
export type Localized = Record<StoreLanguage, string>;
export type Price = { minor: number; currency: string };
export type Photo = { src: string; alt: Localized; width: number; height: number; actualProduct: true; publicApproved: true };
export type Variant = { id: string; label: Localized; available: boolean };
export type Product = {
  id: string; publication: "published"; name: Localized; description: Localized;
  photos: Photo[]; price: Price | null; variants: Variant[];
  availability: "in-stock" | "made-to-order" | "sold-out" | "unavailable";
  dimensions: Localized | null; material: Localized | null; care: Localized | null;
  preparation: Localized | null; fulfillment: Localized | null; safety: Localized | null;
  saleEnabled: boolean;
  approvals: { listing: true; commercialRights: boolean; safetyReview: boolean; fulfillment: boolean };
};
export type Seller = {
  publicApproved: true; adultManaged: true; marketReviewApproved: true;
  displayName: string;
  contact: { kind: "email" | "whatsapp"; value: string; publicApproved: true };
  territory: Localized; delivery: Localized; returns: Localized; privacy: Localized; information: Localized;
};
export type Catalog = { version: 1; salesEnabled: boolean; seller: Seller | null; products: Product[] };
export type Selection = { productId: string; variantId: string; quantity: number };
export type OrderRequest = { href: string; text: string; contact: string; channel: "email" | "whatsapp" };
