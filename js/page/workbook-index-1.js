/* Workbook download-gate companion (CSP-clean; runs alongside /js/lead-form.js).
 * Reveals the #downloads section after a successful lead submission and keeps
 * returning readers unlocked via localStorage. lead-form.js owns the submit,
 * Turnstile, and consent checks; this file only handles the content gate.
 */
(function () {
  'use strict';
  var downloads = document.getElementById('downloads');
  if (!downloads) return;

  function unlock() {
    downloads.style.display = 'block';
    try { localStorage.setItem('hitlai_workbook_unlocked', '1'); } catch (e) {}
    downloads.scrollIntoView({ behavior: 'smooth' });
  }

  // Returning readers stay unlocked.
  try {
    if (localStorage.getItem('hitlai_workbook_unlocked') === '1') {
      downloads.style.display = 'block';
    }
  } catch (e) {}

  // lead-form.js sets the status element's class to 'form-msg success' on a
  // successful submit. Watch for that to reveal the downloads.
  var status = document.getElementById('form-status');
  if (!status) return;
  var observer = new MutationObserver(function () {
    if (/\bsuccess\b/.test(status.className)) {
      observer.disconnect();
      unlock();
    }
  });
  observer.observe(status, { attributes: true, attributeFilter: ['class'] });
})();
