/* Institute checkout attribution (external for strict CSP — no inline JS).
 *
 * The founding-cohort buy buttons and the reserve-redirect form default to the
 * FIRST10 (cold-inbound) promo code. A channel link can override it with a code
 * in the URL — e.g. the seminar QR is hitlai.net/institute?code=JULY7, the NACC
 * letter's link is ?code=NACC2026 — so Stripe records the applied code and you
 * keep per-channel attribution. No param → FIRST10.
 *
 * MUST load BEFORE /js/lead-form.js so the form's data-redirect-on-success is
 * updated before lead-form.js reads it.
 */
(function () {
  'use strict';
  var BASE = 'https://buy.stripe.com/7sY9AU4VwcHA3rd5B71oI00';
  var DEFAULT_CODE = 'FIRST10';

  function channelCode() {
    var m = /[?&]code=([A-Za-z0-9]{1,40})/.exec(window.location.search);
    return m ? m[1].toUpperCase() : DEFAULT_CODE;
  }

  function apply() {
    var url = BASE + '?prefilled_promo_code=' + encodeURIComponent(channelCode());
    // Every buy button that points at the founding-cohort payment link.
    var links = document.querySelectorAll('a[href*="buy.stripe.com/7sY9AU4VwcHA3rd5B71oI00"]');
    Array.prototype.forEach.call(links, function (a) { a.setAttribute('href', url); });
    // The founding-reserve form's post-capture redirect target.
    var form = document.getElementById('lead-form');
    if (form && form.getAttribute('data-redirect-on-success')) {
      form.setAttribute('data-redirect-on-success', url);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})();
