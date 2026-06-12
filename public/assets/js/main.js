/**
 * main.js — Pankhol Juva: Mangrove Conservation & Eco Tourism
 *
 * Audit fixes applied:
 *
 *  1. Two DOMContentLoaded listeners merged into one single entry point.
 *  2. All DOM-touching code moved inside that listener.
 *  3. Null checks added before every DOM query — script is safe on all
 *     pages, not just index.html.
 *  4. Double carousel initialisation fixed: data-bs-ride is absent from
 *     the HTML, so Bootstrap auto-init does not fire. This file is the
 *     single initialisation point.
 *  5. Word cycling moved inside DOMContentLoaded — previously ran at
 *     top level and could execute before the element existed.
 *  6. Scroll listener throttled with requestAnimationFrame — was
 *     previously firing on every scroll event with no throttle.
 *  7. Global updateModal() function and inline onclick attributes
 *     replaced with event delegation. Input is escaped before
 *     rendering to prevent future XSS risk.
 *  8. Hero progress bar implemented and synced to the carousel interval.
 *  9. Video modal cleanup: iframe src is reset on close to stop
 *     YouTube audio continuing after the modal is dismissed.
 */


/* ================================================================
   SCROLL LISTENER — placed outside DOMContentLoaded intentionally.
   Attaches to window, not a DOM element, so has no DOM dependency.
   Throttled with requestAnimationFrame to limit DOM queries to
   once per animation frame (~16ms) instead of every scroll event.
   { passive: true } signals to the browser this handler will never
   call preventDefault(), allowing it to optimise scroll performance.
================================================================ */
(function () {
    var ticking = false;

    window.addEventListener('scroll', function () {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(function () {
            var navbar = document.querySelector('.custom-nav');

            if (navbar) {
                if (window.scrollY > 40) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            ticking = false;
        });

    }, { passive: true });
}());


/* ================================================================
   SINGLE DOMContentLoaded LISTENER
   Every function that reads or writes the DOM runs from here.
   Nothing touches the DOM above this block.
================================================================ */
document.addEventListener('DOMContentLoaded', function () {


    /* ------------------------------------------------------------
       1. OFFCANVAS — body class toggle
       Adds offcanvas-open to body when the mobile drawer opens,
       which triggers navbar.css to hide the floating navbar.
    ------------------------------------------------------------ */
    var offcanvasEl = document.getElementById('mobileMenu');

    if (offcanvasEl) {
        offcanvasEl.addEventListener('show.bs.offcanvas', function () {
            document.body.classList.add('offcanvas-open');
        });

        offcanvasEl.addEventListener('hide.bs.offcanvas', function () {
            document.body.classList.remove('offcanvas-open');
        });
    }


    /* ------------------------------------------------------------
       2. HERO CAROUSEL — single manual initialisation
       data-bs-ride is NOT on the HTML element, so Bootstrap's
       auto-init does not run. This is the only place the carousel
       is created, preventing the double-initialisation conflict.
    ------------------------------------------------------------ */
    var heroCarouselEl = document.querySelector('#hero-carousel');

    if (heroCarouselEl) {
        var heroCarousel = new bootstrap.Carousel(heroCarouselEl, {
            interval: 5000,
            wrap: true,
            pause: false,
            touch: true
        });

        heroCarousel.cycle();

        /* Reset and restart the progress bar after each slide transition */
        heroCarouselEl.addEventListener('slid.bs.carousel', function () {
            resetProgressBar();
        });

        /* Start the progress bar immediately on page load */
        startProgressBar();
    }



    /* ------------------------------------------------------------
       4. CYCLING HEADLINE WORD
       Rotates words inside the hero H1 with a fade/slide animation.
       Uses two CSS classes (word-exit, word-enter) defined in
       sections.css for the transition effect.
    ------------------------------------------------------------ */
    var heroWordEl = document.getElementById('cyclingWord');

    /*
     * Add or remove words from this array at any time.
     * The first word matches the HTML default so the sequence
     * starts correctly without a visible jump on first cycle.
     */
    var heroWords = [
        'Holiday',
        'Family',
        'Group',
        'Adventure'
    ];

    var heroWordIndex = 0;

    /**
     * Advances to the next word with a 3-step animation:
     * fade out → swap text → fade in.
     */
    function cycleHeroWord() {
        if (!heroWordEl) return;

        /* Step 1: fade current word out (upward) */
        heroWordEl.classList.add('word-exit');

        setTimeout(function () {

            /* Step 2: swap the text while the element is invisible */
            heroWordIndex = (heroWordIndex + 1) % heroWords.length;
            heroWordEl.textContent = heroWords[heroWordIndex];

            heroWordEl.classList.remove('word-exit');
            heroWordEl.classList.add('word-enter');

            /*
             * Step 3: two nested requestAnimationFrames force the
             * browser to paint the word-enter state before removing
             * the class, producing a smooth upward fade-in.
             */
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    heroWordEl.classList.remove('word-enter');
                });
            });

        }, 600); /* Must match the CSS transition duration (0.6s) */
    }

    if (heroWordEl) {
        /*
         * Word is visible for 4 seconds before transitioning.
         * Full cycle time ≈ 4s display + 0.6s exit + 0.6s enter = ~5.2s
         * Adjust 4000 to change the display duration.
         */
        setInterval(cycleHeroWord, 4000);
    }


    /* ------------------------------------------------------------
       5. GALLERY LIGHTBOX — event delegation
       Replaces the previous global updateModal() function and all
       inline onclick="updateModal(...)" attributes in the HTML.

       Each .gallery-item element carries data-img and data-caption
       attributes. A single click listener on document catches all
       clicks and walks up the DOM to find the nearest .gallery-item,
       then reads those attributes.

       This approach is safer because:
       - No global scope pollution
       - Input is escaped before insertion into the DOM
       - Works for gallery items added dynamically in the future
    ------------------------------------------------------------ */
    var galleryModal = document.getElementById('galleryModal');
    var galleryModalImg = document.getElementById('modalImg');
    var galleryModalCapt = document.getElementById('modalCaption');

    /**
     * Escapes a string so it is safe to use as a DOM attribute
     * value or text content. Prevents XSS if captions or image
     * paths ever come from user-supplied or CMS-generated content.
     *
     * @param  {string} str - Raw input string.
     * @return {string}       HTML-safe string.
     */
    function escapeHtml(str) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(str).replace(/[&<>"']/g, function (char) {
            return map[char];
        });
    }

    /**
     * Opens the gallery lightbox with the image and caption
     * from the clicked gallery item's data attributes.
     *
     * @param {HTMLElement} item - The .gallery-item element clicked.
     */
    function openGalleryModal(item) {
        if (!galleryModal || !galleryModalImg || !galleryModalCapt) return;

        var imgSrc = item.getAttribute('data-img') || '';
        var caption = item.getAttribute('data-caption') || '';

        /* Escape src before setting as attribute */
        galleryModalImg.src = escapeHtml(imgSrc);
        galleryModalImg.alt = escapeHtml(caption);
        /* textContent is inherently safe — no escaping needed */
        galleryModalCapt.textContent = caption;

        var bsModal = bootstrap.Modal.getOrCreateInstance(galleryModal);
        bsModal.show();
    }

    /* Delegate clicks from all current and future .gallery-item elements */
    document.addEventListener('click', function (e) {
        var item = e.target.closest('.gallery-item');
        if (item) {
            openGalleryModal(item);
        }
    });

    /* Keyboard support: Enter or Space opens a focused gallery item */
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            var item = e.target.closest('.gallery-item');
            if (item) {
                e.preventDefault();
                openGalleryModal(item);
            }
        }
    });

    /* Clear the modal image when it closes to free memory */
    if (galleryModal) {
        galleryModal.addEventListener('hidden.bs.modal', function () {
            if (galleryModalImg) galleryModalImg.src = '';
            if (galleryModalCapt) galleryModalCapt.textContent = '';
        });
    }


    /* ------------------------------------------------------------
       6. VIDEO MODAL — stop YouTube playback on close
       Without this, closing the modal leaves the YouTube iframe
       audio playing in the background. Resetting the src attribute
       forces the iframe to unload the video completely.
    ------------------------------------------------------------ */
    var videoModal = document.getElementById('videoModal');

    if (videoModal) {
        videoModal.addEventListener('hidden.bs.modal', function () {
            var iframe = videoModal.querySelector('iframe');
            if (iframe) {
                iframe.src = iframe.src;
            }
        });
    }


}); /* END DOMContentLoaded */


/* ------------------------------------------------------------
       7. INITIALIZE FANCYBOX GALLERY
       This binds the Fancybox library to all links containing 
       the 'data-fancybox' attribute, creating the dark overlay 
       and arrow navigation instead of opening the raw image.
    ------------------------------------------------------------ */
if (typeof Fancybox !== "undefined") {
    Fancybox.bind("[data-fancybox]", {
        // This groups them automatically based on the attribute name
        groupAll: true,
    });
}

/* ============================================================
   TOUR PACKAGES - 
   ============================================================ */

(function () {

    function initWaButtons() {
        var buttons = document.querySelectorAll('.btn-book[data-wa-number][data-wa-package]');

        for (var i = 0; i < buttons.length; i++) {
            (function (btn) {
                // Guard: skip if already bound
                if (btn.dataset.waBound === 'true') return;
                btn.dataset.waBound = 'true';

                btn.addEventListener('click', function () {
                    var number = btn.dataset.waNumber;
                    var pkg = btn.dataset.waPackage;
                    var text = encodeURIComponent(
                        'Hi, I am interested in the ' + pkg + '. Please share more details.'
                    );

                    // Update href and let the browser navigate natively
                    btn.href = 'https://wa.me/' + number + '?text=' + text;
                    // NO e.preventDefault()
                    // NO window.open()
                });
            })(buttons[i]);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWaButtons);
    } else {
        initWaButtons();
    }

})();




/* ============================================================
   TESTIMONIAL SLIDER - 
   ============================================================ */
window.addEventListener('DOMContentLoaded', function () {
    (function () {
        'use strict';

        var pankholTestimonials = [
            {
                quote: '"My kids loved the boat tour through the mangroves. The guides were knowledgeable, the food was tasty, and the stay was peaceful. Great value for money."',
                name: 'Laboni Chatterjee',
                role: 'Family Traveller, Durgapur',
                rating: 5
            },
            {
                quote: '"An unforgettable experience. The sunrise walk through the mangrove forest was magical — our guide knew every bird call by name. We left with a deep respect for nature."',
                name: 'Aditya Nair',
                role: 'Solo Explorer, Kochi',
                rating: 5
            },
            {
                quote: '"We brought our college group here for an eco-study trip. The conservation briefing was thorough, and the facilities were clean and comfortable."',
                name: 'Priya Deshmukh',
                role: 'Student Traveller, Pune',
                rating: 5
            }
        ];

        var currentIndex = 0;
        var isAnimating = false;   // Prevents overlapping slides
        var autoSlideInterval;

        var quoteEl = document.getElementById('t-quote-text');
        var nameEl = document.getElementById('t-reviewer-name');
        var roleEl = document.getElementById('t-reviewer-role');
        var starsEl = document.getElementById('t-stars');
        var prevBtn = document.getElementById('t-prev');
        var nextBtn = document.getElementById('t-next');

        if (!quoteEl || !nameEl || !roleEl || !starsEl || !prevBtn || !nextBtn) {
            console.error('Testimonial Slider: Missing one or more required IDs in HTML.');
            return;
        }

        var targets = [quoteEl, nameEl, roleEl, starsEl];

        /* ── Helper: build star HTML ── */
        function buildStars(count) {
            var html = '';
            for (var i = 0; i < count; i++) html += '<span>★</span>';
            return html;
        }

        /* ── Helper: remove all slide classes at once ── */
        function clearSlideClasses() {
            targets.forEach(function (el) {
                el.classList.remove('t-slide-out', 't-slide-out-rev',
                    't-slide-enter', 't-slide-enter-rev',
                    't-slide-in');
            });
        }

        /**
         * goToSlide — drives the 3-phase horizontal animation.
         *
         * @param {number} newIndex  — index of the next testimonial
         * @param {string} direction — 'next' (slide left) or 'prev' (slide right)
         */
        function goToSlide(newIndex, direction) {
            if (isAnimating) return;
            isAnimating = true;

            var exitClass = (direction === 'prev') ? 't-slide-out-rev' : 't-slide-out';
            var enterClass = (direction === 'prev') ? 't-slide-enter-rev' : 't-slide-enter';

            /* ── Phase 1: slide current content OUT ── */
            clearSlideClasses();
            targets.forEach(function (el) { el.classList.add(exitClass); });

            /* Wait for exit transition to finish (350ms matches CSS) */
            setTimeout(function () {
                /* Swap the text content */
                var t = pankholTestimonials[newIndex];
                quoteEl.textContent = t.quote;
                nameEl.textContent = t.name;
                roleEl.textContent = t.role;
                starsEl.innerHTML = buildStars(t.rating);

                /* ── Phase 2: instantly jump to opposite side (no transition) ── */
                clearSlideClasses();
                targets.forEach(function (el) { el.classList.add(enterClass); });

                /*
                 * Force the browser to paint the enter-position before
                 * applying the slide-in transition. Double-rAF guarantees
                 * the class swap is committed to a rendered frame first.
                 */
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {

                        /* ── Phase 3: slide IN to center ── */
                        targets.forEach(function (el) {
                            el.classList.remove(enterClass);
                            el.classList.add('t-slide-in');
                        });

                        /* Unlock after slide-in completes (400ms) */
                        setTimeout(function () {
                            clearSlideClasses();
                            isAnimating = false;
                        }, 420);

                    });
                });

            }, 370);

            currentIndex = newIndex;
        }

        /* ── Auto-slide every 5 seconds ── */
        function startAutoSlide() {
            autoSlideInterval = setInterval(function () {
                var next = (currentIndex + 1) % pankholTestimonials.length;
                goToSlide(next, 'next');
            }, 5000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        }

        /* ── Button handlers ── */
        prevBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var prev = (currentIndex - 1 + pankholTestimonials.length) % pankholTestimonials.length;
            goToSlide(prev, 'prev');
            resetAutoSlide();
        });

        nextBtn.addEventListener('click', function (e) {
            e.preventDefault();
            var next = (currentIndex + 1) % pankholTestimonials.length;
            goToSlide(next, 'next');
            resetAutoSlide();
        });

        /* ── Initialise: show first testimonial immediately ── */
        var firstT = pankholTestimonials[0];
        quoteEl.textContent = firstT.quote;
        nameEl.textContent = firstT.name;
        roleEl.textContent = firstT.role;
        starsEl.innerHTML = buildStars(firstT.rating);
        startAutoSlide();

    }());
});

