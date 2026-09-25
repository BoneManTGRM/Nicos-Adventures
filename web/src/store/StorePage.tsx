import { useEffect, useRef, useState, type FormEvent } from "react";
import { createOrderRequest, formatPrice, MAX_QUANTITY, productCanBeRequested } from "./model";
import { storeCopy } from "./copy";
import { useCatalog, CATALOG_FRESH_MS, type CatalogSnapshot } from "./useCatalog";
import type { OrderRequest, Photo, Product, StoreLanguage } from "./types";
import "./store.css";

function initialLanguage(): StoreLanguage {
  const requested = new URLSearchParams(location.search).get("lang");
  return requested === "es-MX" || (!requested && navigator.language.toLowerCase().startsWith("es")) ? "es-MX" : "en";
}
function ProductPhoto({ photo, language, onFailure }: { photo: Photo; language: StoreLanguage; onFailure: () => void }) {
  const [failed, setFailed] = useState(false);
  return failed ? <p className="toy-photo-error">{storeCopy(language).imageMissing}</p> : <img src={photo.src} alt={photo.alt[language]} width={photo.width} height={photo.height} loading="lazy" decoding="async" onError={() => { setFailed(true); onFailure(); }} />;
}
function ProductCard({ product, language, snapshot, fresh, online, refresh }: {
  product: Product; language: StoreLanguage; snapshot: CatalogSnapshot; fresh: boolean; online: boolean;
  refresh: () => Promise<CatalogSnapshot | null>;
}) {
  const copy = storeCopy(language);
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [adult, setAdult] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  const [prepared, setPrepared] = useState<{ request: OrderRequest; checkedAt: number; fingerprint: string } | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fingerprint = JSON.stringify([language, variant, quantity, adult]);
  const enabled = Boolean(snapshot.catalog?.salesEnabled && productCanBeRequested(product) && !photoFailed);
  const ready = prepared && enabled && fresh && adult && prepared.checkedAt === snapshot.checkedAt && prepared.fingerprint === fingerprint ? prepared.request : null;
  const count = Number(quantity);
  const quantityValid = Number.isInteger(count) && count >= 1 && count <= MAX_QUANTITY;
  const selectionValid = quantityValid && (product.variants.length === 0 || product.variants.some(item => item.id === variant && item.available));
  const availability = product.availability === "in-stock" ? copy.inStock : product.availability === "made-to-order" ? copy.made : product.availability === "sold-out" ? copy.soldOut : copy.paused;
  const details = [ [copy.dimensions, product.dimensions], [copy.material, product.material], [copy.care, product.care], [copy.preparation, product.preparation], [copy.fulfillment, product.fulfillment], [copy.safety, product.safety] ] as const;
  async function prepare(event: FormEvent) {
    event.preventDefault(); setPrepared(null); setCopied(null); setError(false);
    if (!enabled || !adult || !online || !navigator.onLine || !selectionValid) { setError(true); return; }
    setBusy(true);
    const latest = await refresh();
    const request = latest?.catalog ? createOrderRequest(latest.catalog, { productId: product.id, variantId: variant, quantity: count }, language, navigator.onLine, adult) : null;
    if (request && latest) setPrepared({ request, checkedAt: latest.checkedAt, fingerprint });
    else setError(true);
    setBusy(false);
  }
  async function copyRequest() {
    if (!ready || !navigator.onLine) return;
    try { await navigator.clipboard.writeText(ready.text); setCopied("yes"); }
    catch { setCopied("failed"); textarea.current?.focus(); textarea.current?.select(); }
  }
  return <article className="toy-card" aria-labelledby={`toy-${product.id}`}>
    <div className="toy-photo"><ProductPhoto key={product.photos[0].src} photo={product.photos[0]} language={language} onFailure={() => setPhotoFailed(true)} /></div>
    <div className="toy-card-body">
      <span className="toy-pill">{availability}</span>
      <h3 id={`toy-${product.id}`}>{product.name[language]}</h3>
      <p>{product.description[language]}</p>
      <p className="toy-price">{product.price ? <>{formatPrice(product.price, language)} <small>{copy.each}</small></> : copy.pricePending}</p>
      <details className="toy-details">
        <summary>{copy.details}</summary>
        {product.photos.length > 1 && <div className="toy-gallery">{product.photos.slice(1).map(photo => <ProductPhoto key={photo.src} photo={photo} language={language} onFailure={() => setPhotoFailed(true)} />)}</div>}
        <dl>{details.map(([label, value]) => value && <div key={label}><dt>{label}</dt><dd>{value[language]}</dd></div>)}</dl>
        {!enabled ? <p className="toy-note">{copy.approvalPending}</p> : <form onSubmit={event => void prepare(event)}>
          {product.variants.length > 0 && <label htmlFor={`option-${product.id}`}><span id={`option-label-${product.id}`}>{copy.option}</span><select aria-labelledby={`option-label-${product.id}`} id={`option-${product.id}`} value={variant} required onChange={event => { setVariant(event.target.value); setPrepared(null); }}>
            <option value="">{copy.choose}</option>{product.variants.map(item => <option key={item.id} value={item.id} disabled={!item.available}>{item.label[language]}{item.available ? "" : ` — ${copy.soldOut}`}</option>)}
          </select></label>}
          <label htmlFor={`quantity-${product.id}`}>{copy.quantity}<input id={`quantity-${product.id}`} type="number" min="1" max={MAX_QUANTITY} step="1" inputMode="numeric" required value={quantity} onChange={event => { setQuantity(event.target.value); setPrepared(null); }} /></label>
          {quantityValid && product.price && <p>{copy.subtotal}: <strong>{formatPrice(product.price, language, count)}</strong></p>}
          <p className="toy-small">{copy.requestOnly}</p>
          <label className="toy-adult"><input type="checkbox" checked={adult} onChange={event => { setAdult(event.target.checked); setPrepared(null); }} /><span>{copy.adult}</span></label>
          <p className="toy-small">{copy.adultNote}</p>
          <button type="submit" className="toy-button" disabled={busy || snapshot.loading || !online || !adult || !selectionValid}>{busy ? copy.preparing : copy.prepare}</button>
          {error && <p role="alert">{copy.blocked}</p>}
          {ready && <section className="toy-request" aria-label={copy.requestTitle}>
            <h4>{copy.requestTitle}</h4><p>{copy.requestNote}</p>
            <a className="toy-button" href={ready.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={event => { if (!navigator.onLine || !fresh || Date.now() - (prepared?.checkedAt ?? 0) >= CATALOG_FRESH_MS) { event.preventDefault(); setPrepared(null); } }}>{ready.channel === "email" ? copy.email : copy.whatsapp}</a>
            <p>{copy.fallback}</p><p><strong>{copy.contact}:</strong> {ready.contact}</p>
            <label htmlFor={`request-${product.id}`}>{copy.requestText}</label><textarea id={`request-${product.id}`} ref={textarea} value={ready.text} readOnly rows={8} />
            <button type="button" onClick={() => void copyRequest()}>{copy.copy}</button>
            {copied && <p aria-live="polite">{copied === "yes" ? copy.copied : copy.copyFailed}</p>}
          </section>}
          {prepared && <p className="toy-small">{copy.expiry}</p>}
        </form>}
      </details>
    </div>
  </article>;
}
export default function StorePage() {
  const [language, setLanguage] = useState<StoreLanguage>(initialLanguage);
  const { snapshot, online, fresh, refresh } = useCatalog();
  const copy = storeCopy(language), catalog = snapshot.catalog;
  useEffect(() => {
    document.title = `${copy.title} | Nico’s World`;
    document.documentElement.lang = language;
    document.body.classList.add("toy-store-view");
    return () => { document.body.classList.remove("toy-store-view"); };
  }, [language, copy.title]);
  function switchLanguage() {
    const next = language === "en" ? "es-MX" : "en";
    // Locale only: no player identity, state or private URL parameters are propagated.
    history.replaceState(null, "", `/store?lang=${next}`); setLanguage(next);
  }
  return <div className="toy-store">
    <a className="toy-skip" href="#toy-main">{language === "en" ? "Skip to shop" : "Ir a la tienda"}</a>
    <header className="toy-header">
      <a className="toy-brand" href="/" aria-label="Nico’s World">NICO’S <strong>WORLD</strong><span aria-hidden="true">✦</span></a>
      <a className="toy-back" href="/">{copy.back}</a>
      <button type="button" onClick={switchLanguage} aria-label={language === "en" ? "Cambiar a español" : "Switch to English"}>{language === "en" ? "Español" : "English"}</button>
    </header>
    <main id="toy-main" tabIndex={-1}>
      <section className="toy-hero" aria-labelledby="toy-heading"><span className="toy-eyebrow">{copy.eyebrow}</span><h1 id="toy-heading">{copy.title}</h1><p className="toy-tagline">{copy.intro}</p><p className="toy-intro">{copy.description}</p><span className="toy-pill">{copy.tag}</span></section>
      <div className="toy-status" role="status" data-testid="store-status">{!online ? copy.offline : snapshot.failed ? copy.unavailable : catalog?.salesEnabled ? copy.open : copy.closed}</div>
      {(!online || snapshot.failed) && <div className="toy-warning" role="alert"><p>{online ? copy.unavailable : copy.offline}</p><button type="button" onClick={() => void refresh()} disabled={!online || snapshot.loading}>{copy.retry}</button></div>}
      {catalog && online && !fresh && !snapshot.loading && !snapshot.failed && <div className="toy-warning"><p>{copy.stale}</p><button type="button" onClick={() => void refresh()}>{copy.retry}</button></div>}
      {snapshot.loading && !catalog ? <p className="toy-loading">{copy.loading}</p> : catalog && catalog.products.length === 0 ? <section className="toy-empty" aria-labelledby="toy-empty-title"><span className="toy-empty-mark" aria-hidden="true">✦</span><h2 id="toy-empty-title">{copy.emptyTitle}</h2><p>{copy.empty}</p><p className="toy-small">{copy.physical}</p></section> : catalog && <section className="toy-collection" aria-labelledby="toy-collection-title"><h2 id="toy-collection-title">{copy.collection}</h2><p className="toy-small">{copy.physical}</p><div className="toy-grid">{catalog.products.map(product => <ProductCard key={product.id} product={product} language={language} snapshot={snapshot} fresh={fresh} online={online} refresh={refresh} />)}</div></section>}
      <section className="toy-how" aria-labelledby="toy-how-title"><h2 id="toy-how-title">{copy.howTitle}</h2><ol>{[copy.how1, copy.how2, copy.how3].map(item => <li key={item}>{item}</li>)}</ol></section>
      <section className="toy-privacy" aria-labelledby="toy-privacy-title"><h2 id="toy-privacy-title">{copy.privacyTitle}</h2><p>{copy.privacy}</p></section>
      <section className="toy-policies" aria-labelledby="toy-policies-title"><h2 id="toy-policies-title">{copy.policies}</h2>{catalog?.seller ? <><p><strong>{catalog.seller.displayName}</strong></p>{([ [copy.territory, catalog.seller.territory], [copy.delivery, catalog.seller.delivery], [copy.returns, catalog.seller.returns], [copy.privacyPolicy, catalog.seller.privacy], [copy.information, catalog.seller.information] ] as const).map(([label, value]) => <details key={label}><summary>{label}</summary><p>{value[language]}</p></details>)}</> : <p>{copy.pendingPolicies}</p>}</section>
    </main>
    <footer className="toy-footer">Nico’s World <span aria-hidden="true">·</span> {copy.tag}</footer>
  </div>;
}
