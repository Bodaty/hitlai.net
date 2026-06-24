/* Resources page: white-paper download modal + scroll-reveal (CSP-clean).
 * The form submit, Turnstile, and consent checks are owned by /js/lead-form.js;
 * this file only opens/closes the modal, sets the whitepaper_slug for the
 * clicked card, and runs the scroll-reveal animations.
 */
(function () {
  'use strict';

  var modal = document.getElementById('download-modal');
  var slugInput = document.getElementById('wp-slug');
  var modalTitle = document.getElementById('modal-title');
  var form = document.getElementById('download-form');
  var submitBtn = document.getElementById('dl-submit');
  var status = document.getElementById('modal-status');

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (modal && slugInput && form && submitBtn) {
    document.querySelectorAll('.download-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        slugInput.value = this.dataset.slug;
        if (modalTitle) modalTitle.textContent = 'Download: ' + this.dataset.title;
        modal.classList.add('active');
        form.reset();
        form.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get download link';
        if (status) { status.className = 'modal-msg form-msg'; status.textContent = ''; }
        // Force a fresh Turnstile token for each download request.
        if (window.turnstile) { try { window.turnstile.reset(); } catch (e) {} }
      });
    });

    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
  }

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
