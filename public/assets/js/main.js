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

// Text Rotation Logic
const words = ["Mangroves", "Heritage", "Future", "Coastline"];
let currentIndex = 0;
const textElement = document.getElementById("changing-text");

function rotateText() {
    // Check if element exists before manipulating
    if (!textElement) return;
    
    textElement.style.opacity = 0; // Fade out
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % words.length;
        textElement.textContent = words[currentIndex];
        textElement.style.opacity = 1; // Fade in
    }, 500); // Half-second transition
}

// Update text every 5 seconds (matching carousel interval)
if (textElement) {
    setInterval(rotateText, 5000);
}