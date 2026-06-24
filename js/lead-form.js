/* Shared lead-capture handler for all marketing forms (external for strict CSP — no inline JS).
 *
 * A form opts in with:
 *   <form data-lead-endpoint="/investor" data-success="Optional custom success text">
 *     ...fields...
 *     <input name="_gotcha" ...>                          (honeypot, kept off-screen)
 *     <div class="cf-turnstile" data-sitekey="..."></div> (Turnstile widget)
 *     <label><input type="checkbox" name="consent" data-consent required> ...</label>
 *     <button type="submit">…</button>
 *     <div class="form-msg" role="status" aria-live="polite"></div>
 *   </form>
 *
 * The backend (marketing-leads Cloud Run) verifies the Turnstile token server-side and rate-limits;
 * the checks here are UX, not security.
 */
(function () {
  'use strict';
  var LEAD_API = 'https://marketing-leads-xy6vr5msca-uc.a.run.app';

  function init(form) {
    var endpoint = form.getAttribute('data-lead-endpoint');
    if (!endpoint) return;
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : '';
    var status = form.querySelector('.form-msg') || document.getElementById('form-status');
    var successMsg = form.getAttribute('data-success') || 'Thanks — we’ll be in touch shortly.';

    function show(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-msg ' + kind;
      status.style.display = '';   // clear any inline display:none so the message is visible
    }
    function rearm() {
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
      if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot — silently drop bots that fill the hidden field
      var hp = form.querySelector('input[name="_gotcha"]');
      if (hp && hp.value) return;

      // Consent gate (forms carry novalidate, so enforce required consent here)
      var consent = form.querySelector('input[type="checkbox"][data-consent]');
      if (consent && !consent.checked) {
        show('Please agree to the privacy notice to continue.', 'error');
        return;
      }

      var data = Object.fromEntries(new FormData(form));

      // Turnstile token is auto-added by the widget as cf-turnstile-response
      if (!data['cf-turnstile-response']) {
        show('Please complete the verification check, then submit again.', 'error');
        return;
      }

      data.source_page = window.location.pathname;   // strip query params (PII minimization)
      data.source_site = window.location.hostname;
      delete data._gotcha;

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      try {
        var res = await fetch(LEAD_API + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        var result = await res.json();
        if (result.success) {
          form.style.display = 'none';
          show(String(result.message || successMsg), 'success');
        } else {
          rearm();
          show(String(result.error || 'Something went wrong. Please try again.'), 'error');
        }
      } catch (err) {
        rearm();
        show('Network error. Please try again.', 'error');
      }
    });
  }

  function boot() {
    var forms = document.querySelectorAll('form[data-lead-endpoint]');
    Array.prototype.forEach.call(forms, init);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
