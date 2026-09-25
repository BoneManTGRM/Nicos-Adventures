/** Synthetic test data, never imported by the application or a production catalog.
 * Approval flags simulate a completed approval path; they are NOT real approvals.
 */
export function syntheticCatalog() {
  const label = (en: string, es = en) => ({ en, "es-MX": es });
  return {
    version: 1, salesEnabled: true,
    seller: {
      publicApproved: true, adultManaged: true, marketReviewApproved: true,
      displayName: "TEST-ONLY SYNTHETIC SELLER",
      contact: { kind: "email", value: "orders@example.invalid", publicApproved: true },
      territory: label("TEST TERRITORY"), delivery: label("TEST DELIVERY TERMS"),
      returns: label("TEST RETURN TERMS"), privacy: label("TEST PRIVACY TERMS"), information: label("TEST SELLER INFORMATION"),
    },
    products: [{
      id: "test-only-block", publication: "published", saleEnabled: true,
      name: label("TEST-ONLY SYNTHETIC BLOCK", "BLOQUE SINTÉTICO SOLO PARA PRUEBAS"),
      description: label("Synthetic fixture. Not a real product.", "Ejemplo sintético. No es un producto real."),
      photos: [{ src: "/store-images/test-only.webp", alt: label("TEST IMAGE — NOT A PRODUCT", "IMAGEN DE PRUEBA — NO ES UN PRODUCTO"), width: 640, height: 480, actualProduct: true, publicApproved: true }],
      price: { minor: 14950, currency: "MXN" },
      variants: [{ id: "blue", label: label("Test blue", "Azul de prueba"), available: true }, { id: "red", label: label("Test red", "Rojo de prueba"), available: false }],
      availability: "in-stock", dimensions: label("TEST DIMENSIONS"), material: label("TEST MATERIAL"),
      care: label("TEST CARE"), preparation: label("TEST PREPARATION"), fulfillment: label("TEST FULFILLMENT"), safety: label("TEST SAFETY INFORMATION"),
      approvals: { listing: true, commercialRights: true, safetyReview: true, fulfillment: true },
    }],
  };
}
