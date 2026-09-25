/** Deferred navigation must not steal focus after the user starts using the new page. */
export function focusNavigationHeading() {
  const heading = document.getElementById('page-title');
  const main = document.getElementById('main-content');
  const active = document.activeElement;
  if (active !== heading && main?.contains(active)) return;
  heading?.focus({ preventScroll: true });
}
