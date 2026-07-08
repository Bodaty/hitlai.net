/* Audit page attribution (external for strict CSP — no inline JS).
 *
 * Task 3's analytics.js isn't live yet, so this page carries its own minimal
 * attribution capture: copy an inbound ?code= (channel code, e.g. a QR or ad
 * link) or, failing that, utm_source/utm_medium/utm_campaign, into the form's
 * hidden "code" field so the /audit lead endpoint can record it on the
 * growth_ledger doc. No param present -> field stays empty; nothing required.
 *
 * Safe to remove once analytics.js lands and takes over attribution site-wide.
 */
(function () {
  'use strict';

  function attributionCode() {
    var params = new URLSearchParams(window.location.search);
    var code = (params.get('code') || '').trim();
    if (code) return code.slice(0, 40);
    var utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map(function (k) { return (params.get(k) || '').trim(); })
      .filter(Boolean);
    return utm.length ? utm.join('|').slice(0, 80) : '';
  }

  function apply() {
    var field = document.getElementById('audit-code');
    if (!field) return;
    field.value = attributionCode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
