    // fx-layer effects
    (function () {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var fine = window.matchMedia('(pointer: fine)').matches;

        var beam = document.querySelector('.scroll-beam');
        if (beam && !reduced) {
            var beamQueued = false;
            function setBeam() {
                beamQueued = false;
                var max = document.documentElement.scrollHeight - window.innerHeight;
                beam.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
            }
            window.addEventListener('scroll', function () {
                if (!beamQueued) { beamQueued = true; requestAnimationFrame(setBeam); }
            }, { passive: true });
            setBeam();
        }

        if (fine) {
            document.querySelectorAll('.tile, .pricing-card, .faq-item, .industry-card, .feature-card, .deployment-option, .department-row, .paper-card, .channel-card, .capability-card, .flow-item, .phase-card, .starting-point, .rec-card, .whats-included').forEach(function (card) {
                card.classList.add('fx-card');
                var spot = document.createElement('div');
                spot.className = 'fx-spot';
                spot.setAttribute('aria-hidden', 'true');
                card.appendChild(spot);
                card.addEventListener('mousemove', function (e) {
                    var r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
                });
            });
        }
    })();
