// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== Project Filter =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.4s ease';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate sections on scroll
document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// ===== Navbar scroll effect =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
});

// ===== Fade In Animation Keyframe =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ===== Media Lightbox (image + video) =====
(function () {
    // Build the lightbox overlay once
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <div class="lightbox-stage">
            <img class="lightbox-media" src="" alt="Enlarged view">
            <video class="lightbox-media" controls playsinline style="display:none;"></video>
        </div>
        <div class="lightbox-zoom" aria-label="Zoom controls">
            <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
            <button type="button" data-zoom="reset" aria-label="Reset zoom">Reset</button>
            <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
        </div>
        <div class="lightbox-hint">Scroll to zoom · drag to pan · double-click to reset</div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img.lightbox-media');
    const lightboxVideo = lightbox.querySelector('video.lightbox-media');
    const zoomControls = lightbox.querySelector('.lightbox-zoom');

    // ----- Zoom / pan state (applies to the image only) -----
    const MIN_SCALE = 1;
    const MAX_SCALE = 8;
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    function applyTransform() {
        lightboxImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        lightboxImg.style.cursor = scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'zoom-in';
    }

    function resetZoom() {
        scale = 1;
        panX = 0;
        panY = 0;
        applyTransform();
    }

    function setScale(newScale) {
        scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
        if (scale === 1) { panX = 0; panY = 0; }
        applyTransform();
    }

    function openImage(src, alt) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
        lightboxVideo.removeAttribute('src');
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Enlarged view';
        lightboxImg.style.display = '';
        zoomControls.style.display = '';
        resetZoom();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function openVideo(src) {
        lightboxImg.style.display = 'none';
        lightboxImg.removeAttribute('src');
        zoomControls.style.display = 'none';
        lightboxVideo.src = src;
        lightboxVideo.style.display = '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lightboxVideo.play().catch(() => { /* autoplay may be blocked; controls remain */ });
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxVideo.pause();
        resetZoom();
        document.body.style.overflow = '';
    }

    // Clicking a project image opens the image (skip placeholders)
    document.querySelectorAll('.project-image img').forEach(img => {
        img.addEventListener('click', () => {
            if (img.closest('.project-image').classList.contains('no-image')) return;
            openImage(img.src, img.alt);
        });
    });

    // Image / Video toggle buttons on a card
    document.querySelectorAll('.media-toggle .media-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const container = btn.closest('.project-image');
            const img = container.querySelector('img');
            if (btn.dataset.media === 'video') {
                const videoSrc = img.getAttribute('data-video');
                if (videoSrc) openVideo(videoSrc);
            } else {
                openImage(img.src, img.alt);
            }
        });
    });

    // ----- Wheel zoom (zoom toward the cursor) -----
    lightboxImg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = lightboxImg.getBoundingClientRect();
        // Cursor position relative to the image center
        const cx = e.clientX - (rect.left + rect.width / 2);
        const cy = e.clientY - (rect.top + rect.height / 2);
        const prevScale = scale;
        const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
        const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale * factor));
        if (nextScale === prevScale) return;
        // Keep the point under the cursor stationary
        const ratio = nextScale / prevScale;
        panX = panX - cx * (ratio - 1);
        panY = panY - cy * (ratio - 1);
        scale = nextScale;
        if (scale === 1) { panX = 0; panY = 0; }
        applyTransform();
    }, { passive: false });

    // ----- Drag to pan -----
    lightboxImg.addEventListener('mousedown', (e) => {
        if (scale <= 1) return;
        e.preventDefault();
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        applyTransform();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (!isPanning) return;
        isPanning = false;
        applyTransform();
    });

    // Double-click toggles between fit and 2x
    lightboxImg.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        if (scale > 1) resetZoom();
        else setScale(2);
    });

    // Zoom control buttons
    zoomControls.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = e.target.dataset.zoom;
        if (action === 'in') setScale(scale * 1.4);
        else if (action === 'out') setScale(scale / 1.4);
        else if (action === 'reset') resetZoom();
    });

    // Close interactions (single click on backdrop closes; media clicks don't)
    lightbox.addEventListener('click', closeLightbox);
    lightboxImg.addEventListener('click', (e) => e.stopPropagation());
    lightboxVideo.addEventListener('click', (e) => e.stopPropagation());
    lightbox.querySelector('.lightbox-stage').addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === '+' || e.key === '=') setScale(scale * 1.4);
        else if (e.key === '-' || e.key === '_') setScale(scale / 1.4);
        else if (e.key === '0') resetZoom();
    });
})();
