/**
 * Updates the Gallery Lightbox Modal
 * @param {string} imgSrc - Path to the image
 * @param {string} caption - Text description
 */
function updateModal(imgSrc, caption) {
    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalCaption').innerText = caption;
}

// Optimized scroll detection for smooth transitions
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.custom-nav');
    
    // Trigger the transition after 40px for a more immediate response
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Text Rotation Logic
const words = ["Mangroves", "Heritage", "Future", "Coastline"];
let currentIndex = 0;
const textElement = document.getElementById("changing-text");

function rotateText() {
    textElement.style.opacity = 0; // Fade out
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % words.length;
        textElement.textContent = words[currentIndex];
        textElement.style.opacity = 1; // Fade in
    }, 500); // Half-second transition
}

// Update text every 5 seconds (matching carousel interval)
setInterval(rotateText, 5000);