/**
 * Updates the Gallery Lightbox Modal
 * @param {string} imgSrc - Path to the image
 * @param {string} caption - Text description
 */
function updateModal(imgSrc, caption) {
    const modalImg = document.getElementById('modalImg');
    const modalCaption = document.getElementById('modalCaption');
    
    if (modalImg && modalCaption) {
        modalImg.src = imgSrc;
        modalCaption.innerText = caption;
    }
}

// Handle offcanvas open/close events to prevent content overlap
document.addEventListener('DOMContentLoaded', function() {
    const offcanvas = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (offcanvas) {
        // Add event listeners for offcanvas show/hide
        offcanvas.addEventListener('show.bs.offcanvas', function () {
            body.classList.add('offcanvas-open');
        });
        
        offcanvas.addEventListener('hide.bs.offcanvas', function () {
            body.classList.remove('offcanvas-open');
        });
    }
});

// Optimized scroll detection for smooth transitions
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.custom-nav');
    
    if (navbar) {
        // Trigger the transition after 40px for a more immediate response
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

const heroWords = [
        "Holiday",
        "Family",
        "Group",
        "Adventure",
        
        
        // ← Add more words here anytime
    ];

    let heroWordIndex = 0;
    const heroWordEl = document.getElementById('cyclingWord');

    function cycleHeroWord() {
        if (!heroWordEl) return;

        // Step 1 — Fade current word out (upward)
        heroWordEl.classList.add('word-exit');

        setTimeout(function () {
            // Step 2 — Swap text instantly at bottom position
            heroWordIndex = (heroWordIndex + 1) % heroWords.length;
            heroWordEl.textContent = heroWords[heroWordIndex];
            heroWordEl.classList.remove('word-exit');
            heroWordEl.classList.add('word-enter');

            // Step 3 — Force browser paint, then animate in smoothly
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    heroWordEl.classList.remove('word-enter');
                });
            });

        }, 600); // Matches CSS transition duration (0.6s)
    }

    if (heroWordEl) {
        /*
           Word stays visible for 4 seconds before changing.
           Total cycle = 4s display + 0.6s exit + 0.6s enter = ~5.2s
           Feels calm and readable — good for a live tourism website.
           Change 4000 to adjust display time.
        */
        setInterval(cycleHeroWord, 4000);
    }

document.addEventListener('DOMContentLoaded', function () {
    const myCarouselElement = document.querySelector('#hero-carousel');
    
    // Explicitly initialize with WRAP set to TRUE
    const carousel = new bootstrap.Carousel(myCarouselElement, {
        interval: 5000,
        wrap: true, // This ensures image 4 goes back to image 1
        pause: false, // Keeps cycling even if user hovers
        touch: true  // Vital for mobile friendliness
    });

    // Resetting the loop if it ever hits an 'end' state
    myCarouselElement.addEventListener('slid.bs.carousel', function () {
        carousel.cycle();
    });
});