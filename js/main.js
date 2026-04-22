/**
 * Main Application Logic
 * Standard: Vanilla JS chuyên nghiệp
 * Mobile-First: Tối ưu UX cho thiết bị cảm ứng
 * 
 * Modules:
 * 1. Mobile Menu
 * 2. Hero Banner Carousel
 * 3. Dynamic Content Loader (Products + Blog)
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("MTH Web Interface initialized successfully.");

    // =========================================================================
    // 1. MOBILE MENU — Hamburger Toggle & Drawer
    // =========================================================================
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.navbar-menu');
    const overlay = document.getElementById('mobile-overlay');
    const dropdownItems = document.querySelectorAll('.nav-item-dropdown');

    function openMenu() {
        menuToggle.classList.add('active');
        navMenu.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        dropdownItems.forEach(item => item.classList.remove('open'));
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // =========================================================================
    // 2. MOBILE DROPDOWN — Accordion toggle (touch-friendly)
    // =========================================================================
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdownItems.forEach(other => {
                        if (other !== item) other.classList.remove('open');
                    });
                    item.classList.toggle('open');
                }
            });
        }
    });

    // =========================================================================
    // 3. RESIZE HANDLER — Reset mobile states on desktop
    // =========================================================================
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // =========================================================================
    // 4. HERO BANNER CAROUSEL
    // =========================================================================
    const carouselSection = document.getElementById('hero-carousel');
    if (carouselSection) {
        initBannerCarousel();
    }

    // =========================================================================
    // 5. DYNAMIC CONTENT LOADER — Products & Blog from data/ JSON
    // =========================================================================
    const productGrids = document.querySelectorAll('.products-grid[data-section]');
    const blogGrid = document.getElementById('homepage-blog-grid');
    if (productGrids.length > 0 || blogGrid) {
        initDynamicContent();
    }
});


// =============================================================================
// BANNER CAROUSEL MODULE
// =============================================================================
async function initBannerCarousel() {
    const track = document.querySelector('.hero-slides-track');
    const dotsContainer = document.getElementById('hero-dots');
    const prevBtn = document.getElementById('hero-prev');
    const nextBtn = document.getElementById('hero-next');

    if (!track || !dotsContainer) return;

    // Fetch banner data
    let banners = [];
    try {
        const index = await fetchJSON('./data/content-index.json');
        if (index && index.banners) {
            const bannerPromises = index.banners.map(path => fetchJSON(`./data/${path}`));
            const results = await Promise.allSettled(bannerPromises);
            banners = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value)
                .filter(b => b.visible !== false)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        }
    } catch (err) {
        console.warn('Banner data not found, using fallback:', err);
    }

    // Fallback if no banners loaded
    if (banners.length === 0) {
        banners = [{
            title: "MTH Beauty",
            image: "https://images.unsplash.com/photo-1596462502278-27bf84033001?q=80&w=2071&auto=format&fit=crop",
            heading: "Đánh Thức Vẻ Đẹp,\nLan Tỏa Khí Chất",
            subtitle: "Khám phá những kiệt tác chăm sóc sắc đẹp cao cấp.",
            badge_text: "BỘ SƯU TẬP MỚI",
            cta_text: "KHÁM PHÁ NGAY",
            cta_link: "#",
            visible: true,
            sort_order: 1
        }];
    }

    // Render slides
    banners.forEach((banner, i) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        slide.innerHTML = `
            <div class="hero-slide-bg">
                <img src="${banner.image}" alt="${banner.title || 'Banner'}" loading="${i === 0 ? 'eager' : 'lazy'}">
                <div class="hero-slide-overlay"></div>
            </div>
            <div class="hero-slide-content">
                <div class="hero-slide-inner">
                    ${banner.badge_text ? `<span class="hero-badge">${banner.badge_text}</span>` : ''}
                    ${banner.heading ? `<h1 class="hero-title">${banner.heading.replace(/\n/g, '<br>')}</h1>` : ''}
                    ${banner.subtitle ? `<p class="hero-subtitle">${banner.subtitle}</p>` : ''}
                    <div class="hero-buttons">
                        ${banner.cta_text ? `<a href="${banner.cta_link || '#'}" class="btn btn-primary">${banner.cta_text}</a>` : ''}
                    </div>
                </div>
            </div>
        `;
        track.appendChild(slide);
    });

    // Render dots
    banners.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
        dot.setAttribute('aria-label', `Banner ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    let currentSlide = 0;
    const totalSlides = banners.length;
    let autoPlayInterval = null;

    function goToSlide(index) {
        currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        // Update dots
        dotsContainer.querySelectorAll('.hero-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
        // Re-trigger content animation
        const activeSlide = track.children[currentSlide];
        if (activeSlide) {
            const inner = activeSlide.querySelector('.hero-slide-inner');
            if (inner) {
                inner.style.animation = 'none';
                inner.offsetHeight; // force reflow
                inner.style.animation = '';
            }
        }
        resetAutoPlay();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // Wire up buttons
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Auto-advance
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Pause on hover
    const carouselSection = document.getElementById('hero-carousel');
    if (carouselSection) {
        carouselSection.addEventListener('mouseenter', () => {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
        });
        carouselSection.addEventListener('mouseleave', startAutoPlay);
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, { passive: true });

    // Hide arrows if only 1 banner
    if (totalSlides <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        dotsContainer.style.display = 'none';
    }

    startAutoPlay();
}


// =============================================================================
// DYNAMIC CONTENT LOADER MODULE
// =============================================================================
async function initDynamicContent() {
    try {
        const index = await fetchJSON('./data/content-index.json');
        if (!index) return;

        // Load all products
        let allProducts = [];
        if (index.products) {
            const results = await Promise.allSettled(
                index.products.map(path => fetchJSON(`./data/${path}`))
            );
            allProducts = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value)
                .filter(p => p.visible !== false)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        }

        // Render products to each section grid
        const sectionMap = {
            'uu-dai-theo-chuong-trinh': 'uu-dai-theo-chuong-trinh',
            'uu-dai-theo-thuong-hieu': 'uu-dai-theo-thuong-hieu',
            'san-pham-theo-nhu-cau': 'san-pham-theo-nhu-cau'
        };

        document.querySelectorAll('.products-grid[data-section]').forEach(grid => {
            const sectionKey = grid.dataset.section;
            // Also include products tagged for "homepage" in all homepage sections
            const sectionProducts = allProducts.filter(p => {
                if (!p.display_pages || !Array.isArray(p.display_pages)) return false;
                return p.display_pages.includes(sectionKey) || p.display_pages.includes('homepage');
            });

            // Limit to 4 products per section on homepage
            const limitedProducts = sectionProducts.slice(0, 4);

            if (limitedProducts.length === 0) {
                // Hide empty sections
                const section = grid.closest('.products-section');
                if (section) section.style.display = 'none';
                return;
            }

            limitedProducts.forEach(product => {
                grid.appendChild(createProductCard(product));
            });
        });

        // Load and render blog posts
        const blogGrid = document.getElementById('homepage-blog-grid');
        if (blogGrid && index.blog) {
            const blogResults = await Promise.allSettled(
                index.blog.map(path => fetchJSON(`./data/${path}`))
            );
            const blogPosts = blogResults
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value)
                .filter(b => b.visible !== false && b.display_on_homepage === true)
                .slice(0, 3); // Max 3 blog posts

            if (blogPosts.length === 0) {
                const section = blogGrid.closest('.blog-section');
                if (section) section.style.display = 'none';
                return;
            }

            blogPosts.forEach(post => {
                blogGrid.appendChild(createBlogCard(post));
            });
        }
    } catch (err) {
        console.warn('Dynamic content loading failed:', err);
    }
}


// =============================================================================
// CARD BUILDERS
// =============================================================================

/**
 * Create a product card element from JSON data.
 * Automatically calculates discount % from original vs current price.
 */
function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    // Calculate discount percentage
    let discountPercent = 0;
    if (product.original_price && product.current_price && product.original_price > product.current_price) {
        discountPercent = Math.round((1 - product.current_price / product.original_price) * 100);
    }

    // Build badges
    let badgesHTML = '';
    if (discountPercent > 0 || product.badge) {
        badgesHTML = '<div class="product-badges-container">';
        if (discountPercent > 0) {
            badgesHTML += `<span class="product-badge badge-sale">-${discountPercent}%</span>`;
        }
        if (product.badge) {
            badgesHTML += `<span class="product-badge badge-hot">${product.badge}</span>`;
        }
        badgesHTML += '</div>';
    }

    // Format prices 
    const currentFormatted = formatPrice(product.current_price);
    const originalFormatted = product.original_price > product.current_price
        ? formatPrice(product.original_price) : '';

    card.innerHTML = `
        <div class="product-image-wrapper">
            ${badgesHTML}
            <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            <div class="product-action-overlay">
                <button class="btn btn-primary btn-buy">MUA NGAY</button>
            </div>
        </div>
        <div class="product-info">
            <span class="product-vendor">${product.vendor || ''}</span>
            <h3 class="product-name">${product.title}</h3>
            <div class="product-price-row">
                <span class="price-current">${currentFormatted}</span>
                ${originalFormatted ? `<span class="price-old">${originalFormatted}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

/**
 * Create a blog card element from JSON data.
 */
function createBlogCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';

    // Format date
    let dateStr = '';
    if (post.date) {
        const d = new Date(post.date);
        const months = ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
                        'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        dateStr = `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }

    card.innerHTML = `
        <div class="blog-image-wrapper">
            <img src="${post.thumbnail || ''}" alt="${post.title}" class="blog-image" loading="lazy">
        </div>
        <div class="blog-category">${post.category || ''}</div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt || ''}</p>
        <div class="blog-footer">
            <span class="blog-date">${dateStr}</span>
            <span class="blog-read-time">5 phút đọc</span>
        </div>
    `;

    return card;
}


// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Fetch and parse a JSON file. Returns null on failure.
 */
async function fetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

/**
 * Format a number as VND currency string.
 * Example: 3800000 → "3.800.000₫"
 */
function formatPrice(value) {
    if (!value && value !== 0) return '';
    return value.toLocaleString('vi-VN') + '₫';
}
