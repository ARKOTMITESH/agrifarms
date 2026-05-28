/* ==========================================================
   VETIVER AGRO FARM — JavaScript
   ========================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {

    /* ---- NAVBAR SCROLL ---- */
    const navbar = document.querySelector('.v-navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ---- BACK TO TOP ---- */
    const btt = document.querySelector('.back-to-top');
    if (btt) {
        window.addEventListener('scroll', () => btt.classList.toggle('show', window.scrollY > 320), { passive: true });
        btt.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    /* ---- ANIMATED COUNTERS ---- */
    function runCounter(el) {
        const target   = parseInt(el.getAttribute('data-target') || '0', 10);
        const duration = 2000;
        const step     = target / (duration / 16);
        let   current  = 0;
        const suffix   = el.getAttribute('data-suffix') || '';
        const timer    = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current).toLocaleString() + suffix;
        }, 16);
    }

    /* ---- SCROLL ANIMATIONS ---- */
    const animObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            entry.target.querySelectorAll('[data-target]').forEach(c => {
                if (!c.hasAttribute('data-counted')) {
                    c.setAttribute('data-counted', '1');
                    runCounter(c);
                }
            });
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.animate-on-scroll, .stats-bar').forEach(el => animObserver.observe(el));

    /* ---- HERO PARTICLES ---- */
    const pContainer = document.querySelector('.hero-particles');
    if (pContainer) {
        const icons = ['🌿','🍃','🌱','🍀'];
        for (let i = 0; i < 14; i++) {
            const span = document.createElement('span');
            span.className = 'leaf';
            span.textContent = icons[Math.floor(Math.random() * icons.length)];
            span.style.cssText = `
                left: ${Math.random() * 100}%;
                animation-duration: ${8 + Math.random() * 10}s;
                animation-delay: ${Math.random() * 12}s;
                font-size: ${10 + Math.random() * 14}px;
            `;
            pContainer.appendChild(span);
        }
    }

    /* ---- LIGHTBOX ---- */
    const lb      = document.getElementById('lightboxOverlay');
    const lbImg   = document.getElementById('lightboxImg');
    const lbClose = document.querySelector('.lightbox-close');

    function openLightbox(src) {
        if (!lb || !lbImg) return;
        lbImg.src = src;
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        if (!lb) return;
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-lightbox]').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) openLightbox(img.src);
        });
    });
    lbClose && lbClose.addEventListener('click', closeLightbox);
    lb && lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    /* ---- PRODUCT / GALLERY FILTER ---- */
    function setupFilter(btnSelector, itemSelector, attrName) {
        const btns  = document.querySelectorAll(btnSelector);
        const items = document.querySelectorAll(itemSelector);
        if (!btns.length || !items.length) return;

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute(attrName);
                items.forEach(item => {
                    const show = filter === 'all' || item.getAttribute('data-category') === filter;
                    item.style.display       = show ? '' : 'none';
                    item.style.opacity       = show ? '0' : '0';
                    if (show) setTimeout(() => { item.style.opacity = '1'; item.style.transition = 'opacity .4s'; }, 30);
                });
            });
        });
    }
    setupFilter('.filter-btn',         '.product-card-wrap',  'data-filter');
    setupFilter('.gallery-filter-btn', '.gallery-item',       'data-filter');

    /* ---- TESTIMONIALS AUTO-ROTATE ---- */
    const slides = document.querySelectorAll('.testi-slide');
    if (slides.length > 1) {
        let idx = 0;
        slides.forEach((s, i) => s.style.display = i === 0 ? '' : 'none');
        setInterval(() => {
            slides[idx].style.display = 'none';
            idx = (idx + 1) % slides.length;
            slides[idx].style.display = '';
        }, 5000);
    }

    /* ---- CONTACT FORM ---- */
    const form = document.getElementById('vetiverContactForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn  = this.querySelector('[type="submit"]');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending…';
            btn.disabled  = true;
            setTimeout(() => {
                btn.innerHTML        = '<i class="fas fa-check me-2"></i>Message Sent!';
                btn.style.background = 'linear-gradient(135deg,#40916C,#2D6A4F)';
                setTimeout(() => {
                    btn.innerHTML = orig; btn.disabled = false;
                    btn.style.background = ''; this.reset();
                }, 3000);
            }, 2000);
        });
    }

    /* ---- MOBILE MENU DRAWERS & BACKDROP ---- */
    const navCollapse = document.getElementById('navbarCollapse');
    if (navCollapse) {
        // Create backdrop element dynamically
        let backdrop = document.querySelector('.mobile-menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'mobile-menu-backdrop';
            document.body.appendChild(backdrop);
        }

        // Collapse events to toggle backdrop & scroll-lock
        navCollapse.addEventListener('show.bs.collapse', () => {
            backdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
        navCollapse.addEventListener('hide.bs.collapse', () => {
            backdrop.classList.remove('show');
            document.body.style.overflow = '';
        });

        // Hide when clicking backdrop
        backdrop.addEventListener('click', () => {
            if (typeof bootstrap !== 'undefined') {
                const bsCollapse = bootstrap.Collapse.getInstance(navCollapse) || new bootstrap.Collapse(navCollapse);
                bsCollapse.hide();
            }
        });
    }

    /* ---- MOBILE MENU CLOSE ON NAV CLICK ---- */
    document.querySelectorAll('.v-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const collapse = document.querySelector('.navbar-collapse.show');
            if (collapse && typeof bootstrap !== 'undefined') {
                bootstrap.Collapse.getInstance(collapse)?.hide();
            }
        });
    });

    /* ---- ACTIVE NAV LINK ---- */
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.v-nav-link').forEach(link => {
        const href = (link.getAttribute('href') || '').split('#')[0];
        if (href === page) link.classList.add('active');
    });

    /* ---- SMOOTH SCROLL ANCHORS ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });
});
