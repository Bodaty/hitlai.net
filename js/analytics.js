/* Tracking spine v0 — GA4 + Meta pixel (external for strict CSP — no inline JS).
 *
 * Loads gtag.js (GA4) and the Meta pixel base code, both as dynamically-inserted
 * <script> tags from this external file (never inline), then exposes:
 *
 *   window.mmTrack(event, params)   — mirrors one event to gtag('event', ...)
 *                                      and fbq('trackCustom', ...)
 *
 * Auto-wired, site-wide, no per-page opt-in required:
 *   - buy_click   on click of any a[href*="buy.stripe.com"]
 *                 (param: promo_code, read from ?prefilled_promo_code= on the href)
 *   - lead_submit on success of any form[data-lead-endpoint]
 *                 (param: endpoint; hooks the same 'form-msg success' class the
 *                  lead-form.js status element gets on a successful POST — see
 *                  js/page/workbook-index-1.js for the established pattern)
 *
 * Inbound ?code= / ?utm_* is captured once and persisted to sessionStorage so
 * attribution survives navigation across pages in the same session; the stored
 * values are merged into every gtag config call and every mmTrack() event as
 * default params.
 */
(function () {
  'use strict';

  var GA4_ID = 'G-6K7WSE5WST';
  var META_PIXEL_ID = '947158221066064';

  // ---- Attribution: capture inbound code/utm_*, persist across navigation ----
  var ATTR_KEY = 'hitlai_attr';
  var ATTR_FIELDS = ['code', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

  function readStoredAttribution() {
    try {
      var raw = sessionStorage.getItem(ATTR_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function captureAttribution() {
    var params = new URLSearchParams(window.location.search);
    var stored = readStoredAttribution();
    var changed = false;
    ATTR_FIELDS.forEach(function (key) {
      var v = (params.get(key) || '').trim();
      if (v) {
        stored[key] = v.slice(0, 80);
        changed = true;
      }
    });
    if (changed) {
      try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(stored)); } catch (e) {}
    }
    return stored;
  }

  var attribution = captureAttribution();

  var urlParams = new URLSearchParams(window.location.search);
  var debugMode = urlParams.get('debug_mode') === '1' || urlParams.get('debug_mode') === 'true';

  // ---- GA4 (gtag.js) ----
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA4_ID, Object.assign({}, attribution, debugMode ? { debug_mode: true } : {}));

  var gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(gtagScript);

  // ---- Meta Pixel (standard base code, external form) ----
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');

  // ---- window.mmTrack(event, params) — mirrors to both GA4 and Meta ----
  window.mmTrack = function (event, params) {
    var merged = Object.assign({}, attribution, params || {});
    try { window.gtag('event', event, merged); } catch (e) {}
    try { window.fbq('trackCustom', event, merged); } catch (e) {}
  };

  // ---- Auto-wire: buy_click on any Stripe buy-button click ----
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="buy.stripe.com"]') : null;
    if (!a) return;
    var promo = '';
    try {
      var href = a.getAttribute('href') || '';
      var qIndex = href.indexOf('?');
      if (qIndex > -1) {
        promo = new URLSearchParams(href.slice(qIndex)).get('prefilled_promo_code') || '';
      }
    } catch (err) {}
    var params = promo ? { promo_code: promo } : {};
    var merged = Object.assign({}, attribution, params);
    // gtag needs beacon transport to guarantee delivery before page unload on navigation
    try { window.gtag('event', 'buy_click', Object.assign({ transport_type: 'beacon' }, merged)); } catch (e) {}
    // fbq doesn't support beacon transport; keep payload clean of gtag-specific params
    try { window.fbq('trackCustom', 'buy_click', merged); } catch (e) {}
  }, true);

  // ---- Auto-wire: lead_submit on form[data-lead-endpoint] success ----
  // Mirrors the status-element lookup and 'form-msg success' watch that
  // js/lead-form.js / js/page/workbook-index-1.js already use.
  function wireLeadForm(form) {
    var endpoint = form.getAttribute('data-lead-endpoint');
    if (!endpoint) return;
    var status = form.querySelector('.form-msg') || document.getElementById('form-status');
    if (!status) return;
    var fired = false;
    var observer = new MutationObserver(function () {
      if (!fired && /\bsuccess\b/.test(status.className)) {
        fired = true;
        window.mmTrack('lead_submit', { endpoint: endpoint });
      }
    });
    observer.observe(status, { attributes: true, attributeFilter: ['class'] });
  }

  function wireLeadForms() {
    var forms = document.querySelectorAll('form[data-lead-endpoint]');
    Array.prototype.forEach.call(forms, wireLeadForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireLeadForms);
  } else {
    wireLeadForms();
  }
})();
