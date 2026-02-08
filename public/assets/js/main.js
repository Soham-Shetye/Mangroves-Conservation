/**
 * Updates the Gallery Lightbox Modal
 * @param {string} imgSrc - Path to the image
 * @param {string} caption - Text description
 */
function updateModal(imgSrc, caption) {
    document.getElementById('modalImg').src = imgSrc;
    document.getElementById('modalCaption').innerText = caption;
}