    // Effect layer: word reveal, marquee, spotlights, tilt, scroll beam
    (function () {
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var fine = window.matchMedia('(pointer: fine)').matches;

        /* --- Word-by-word headline reveal --- */
        var h1 = document.getElementById('hero-title');
        if (h1 && !reduced) {
            var delay = 250;
            function splitWords(parent) {
                Array.prototype.slice.call(parent.childNodes).forEach(function (node) {
                    if (node.nodeType === 3) {
                        var frag = document.createDocumentFragment();
                        node.textContent.split(/(\s+)/).forEach(function (part) {
                            if (!part) return;
                            if (/^\s+$/.test(part)) {
                                frag.appendChild(document.createTextNode(part));
                            } else {
                                var w = document.createElement('span');
                                w.className = 'w';
                                w.style.setProperty('--d', delay + 'ms');
                                w.textContent = part;
                                frag.appendChild(w);
                                delay += 75;
                            }
                        });
                        parent.replaceChild(frag, node);
                    } else if (node.nodeType === 1 && node.tagName !== 'BR') {
                        splitWords(node);
                    }
                });
            }
            splitWords(h1);
            h1.style.opacity = '1';
            h1.style.animation = 'none';
        }

        /* --- Channel marquee --- */
        var channels = document.querySelector('.channels');
        if (channels && !reduced) {
            var wrap = document.createElement('div');
            wrap.className = 'marquee';
            channels.parentNode.insertBefore(wrap, channels);
            wrap.appendChild(channels);
            var clone = channels.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.removeAttribute('role');
            wrap.appendChild(clone);
        }

        /* --- Scroll progress beam --- */
        var beam = document.querySelector('.scroll-beam');
        if (beam && !reduced) {
            var queued = false;
            function setBeam() {
                queued = false;
                var max = document.documentElement.scrollHeight - window.innerHeight;
                beam.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
            }
            window.addEventListener('scroll', function () {
                if (!queued) { queued = true; requestAnimationFrame(setBeam); }
            }, { passive: true });
            setBeam();
        }

        /* --- Card spotlights --- */
        if (fine) {
            document.querySelectorAll('.phase, .industry, .price-card, .benefit').forEach(function (card) {
                card.addEventListener('mousemove', function (e) {
                    var r = card.getBoundingClientRect();
                    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
                });
            });
        }

        /* --- 3D tilt on trust-journey phases --- */
        if (fine && !reduced) {
            document.querySelectorAll('.phase').forEach(function (card) {
                var rx = 0, ry = 0, trx = 0, tryy = 0, active = false;
                function tiltFrame() {
                    rx += (trx - rx) * 0.1;
                    ry += (tryy - ry) * 0.1;
                    card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-3px)';
                    if (active || Math.abs(rx) > 0.05 || Math.abs(ry) > 0.05) requestAnimationFrame(tiltFrame);
                    else { card.style.transform = ''; card.style.transition = ''; }
                }
                card.addEventListener('mouseenter', function () {
                    card.style.transition = 'border-color 250ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms cubic-bezier(0.22,1,0.36,1), background 250ms cubic-bezier(0.22,1,0.36,1)';
                    if (!active) { active = true; requestAnimationFrame(tiltFrame); }
                });
                card.addEventListener('mousemove', function (e) {
                    var r = card.getBoundingClientRect();
                    tryy = ((e.clientX - r.left) / r.width - 0.5) * 6;
                    trx = (0.5 - (e.clientY - r.top) / r.height) * 6;
                });
                card.addEventListener('mouseleave', function () { active = false; trx = 0; tryy = 0; });
            });
        }
    })();
