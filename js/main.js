/**
 * Main Application Logic
 * Standard: Vanilla JS chuyên nghiệp
 * Mobile-First: Tối ưu UX cho thiết bị cảm ứng
 * 
 * Modules:
 * 1. Mobile Menu
 * 2. Hero Banner Carousel
 * 3. Dynamic Content Loader (Products + Blog)
 * 4. Product Detail & Order System
 */

// =============================================================================
// CONFIG — Google Apps Script Web App URL (đơn hàng & tracking)
// =============================================================================
const ORDER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIN7kIEX62jmqM_iStqs1u9Xy9uaDMJ15SjTnvid6-7_GHQMoKYrlN5wHGb8gTi3Am/exec';

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
    const dynamicGrids = document.querySelectorAll('.dynamic-grid');
    const dynamicBlogGrids = document.querySelectorAll('.dynamic-blog-grid');
    const blogGrid = document.getElementById('homepage-blog-grid');
    const childPagesContainer = document.getElementById('dynamic-child-pages-container');
    if (productGrids.length > 0 || dynamicGrids.length > 0 || blogGrid || dynamicBlogGrids.length > 0 || childPagesContainer) {
        initDynamicContent();
    }

    // =========================================================================
    // 6. ANNOUNCEMENT BAR — Dynamic from CMS
    // =========================================================================
    initAnnouncementBar();
    
    // Initial Route Check
    if (typeof handleRoute === 'function') {
        handleRoute();
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
        const index = await fetchJSON('/data/content-index.json');
        if (index && index.banners) {
            const bannerPromises = index.banners.map(path => fetchJSON(`/data/${path}`));
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
    function startAutoPlay(delay = 6000) {
        autoPlayInterval = setInterval(nextSlide, delay);
    }

    function resetAutoPlay(delay = 10000) {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        startAutoPlay(delay);
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
        const index = await fetchJSON('/data/content-index.json');
        if (!index) return;

        // Load all products
        let allProducts = [];
        if (index.products) {
            const results = await Promise.allSettled(
                index.products.map(path => fetchJSON(`/data/${path}`).then(data => {
                    if (data) data._slug = path.split('/').pop().replace('.json', '');
                    return data;
                }))
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

        // Render dynamic category grids on subpages
        const dynamicContainer = document.getElementById('dynamic-child-pages-container');
        if (dynamicContainer) {
            const pathInfo = window.location.pathname;
            let pageSlug = null;
            if (pathInfo.includes('uu-dai-theo-chuong-trinh')) pageSlug = 'uu-dai-theo-chuong-trinh';
            else if (pathInfo.includes('uu-dai-theo-thuong-hieu')) pageSlug = 'uu-dai-theo-thuong-hieu';
            else if (pathInfo.includes('san-pham-theo-nhu-cau')) pageSlug = 'san-pham-theo-nhu-cau';

            if (pageSlug) {
                // Load all child pages
                let allChildPages = [];
                if (index.child_pages) {
                    const cpResults = await Promise.allSettled(
                        index.child_pages.map(path => fetchJSON(`/data/${path}`).then(data => {
                            if (data) data._slug = path.split('/').pop().replace('.json', '').replace(/\?.*$/, '');
                            return data;
                        }))
                    );
                    allChildPages = cpResults
                        .filter(r => r.status === 'fulfilled' && r.value)
                        .map(r => r.value)
                        .filter(p => p.visible !== false && p.parent_page === pageSlug);
                }

                dynamicContainer.innerHTML = ''; // clear loading text

                if (allChildPages.length === 0) {
                    dynamicContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--gold-light);">Hiện chưa có chuyên mục nào.</div>';
                } else {
                    allChildPages.forEach(cp => {
                        // find products for this child page
                        const cpProducts = allProducts.filter(p => {
                            if (!p.child_pages) return false;
                            const cpIds = Array.isArray(p.child_pages) ? p.child_pages : [p.child_pages];
                            return cpIds.includes(cp._slug);
                        });

                        // create section html
                        const section = document.createElement('section');
                        section.className = 'deal-section';
                        section.id = cp._slug;

                        const header = document.createElement('div');
                        header.className = 'deal-section-header';

                        // Default icon logic based on keywords
                        let icon = '✨';
                        if (cp.title.toLowerCase().includes('dưỡng')) icon = '💧';
                        else if (cp.title.toLowerCase().includes('trang điểm')) icon = '💄';
                        else if (cp.title.toLowerCase().includes('wellness') || cp.title.toLowerCase().includes('sức khỏe')) icon = '🌿';

                        header.innerHTML = `
                            <div class="deal-section-icon" aria-hidden="true">${icon}</div>
                            <h2 class="deal-section-title">${cp.title}</h2>
                            <span class="deal-section-count">${cp.description || 'Khám phá ưu đãi'}</span>
                        `;
                        section.appendChild(header);

                        const grid = document.createElement('div');
                        grid.className = 'deal-grid';
                        
                        if (cpProducts.length === 0) {
                            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 20px; color: #888;">Chưa có sản phẩm.</div>';
                        } else {
                            cpProducts.forEach(product => {
                                const div = document.createElement('div');
                                div.innerHTML = createDealCard(product);
                                grid.appendChild(div.firstElementChild);
                            });
                        }
                        
                        section.appendChild(grid);
                        dynamicContainer.appendChild(section);
                    });
                }
            }
        }

        // Fallback for any remaining static dynamic-grid definitions
        document.querySelectorAll('.dynamic-grid').forEach(grid => {
            const cat = grid.getAttribute('data-category');
            const vendor = grid.getAttribute('data-vendor');
            const badge = grid.getAttribute('data-badge');
            
            let filtered = allProducts;

            // Page Context Filtering
            const pathInfo = window.location.pathname;
            let pageSlug = null;
            if (pathInfo.includes('uu-dai-theo-chuong-trinh')) pageSlug = 'uu-dai-theo-chuong-trinh';
            else if (pathInfo.includes('uu-dai-theo-thuong-hieu')) pageSlug = 'uu-dai-theo-thuong-hieu';
            else if (pathInfo.includes('san-pham-theo-nhu-cau')) pageSlug = 'san-pham-theo-nhu-cau';

            if (pageSlug) {
                // Only include products that explicitly selected this page in CMS
                filtered = filtered.filter(p => p.display_pages && Array.isArray(p.display_pages) && p.display_pages.includes(pageSlug));
            }
            
            if (cat) {
                filtered = filtered.filter(p => Array.isArray(p.category) ? p.category.includes(cat) : p.category === cat);
            }
            if (vendor) {
                filtered = filtered.filter(p => (p.vendor || '').toLowerCase() === vendor.toLowerCase());
            }
            if (badge) {
                filtered = filtered.filter(p => (p.badge || '').toLowerCase().includes(badge.toLowerCase()));
            }

            // Remove static content
            grid.innerHTML = '';
            filtered.forEach(product => {
                // Append instead of overwrite
                const div = document.createElement('div');
                div.innerHTML = createDealCard(product);
                grid.appendChild(div.firstElementChild);
            });
        });

        // Load and render blog posts
        let allBlogPosts = [];
        if (index.blog) {
            const blogResults = await Promise.allSettled(
                index.blog.map(path => fetchJSON(`/data/${path}`).then(data => {
                    if (data) data._slug = path.split('/').pop().replace('.json', '').replace(/\?.*$/, '');
                    return data;
                }))
            );
            allBlogPosts = blogResults
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value)
                .filter(b => b.visible !== false);
        }

        // Homepage blog grid (max 3, only display_on_homepage)
        const blogGrid = document.getElementById('homepage-blog-grid');
        if (blogGrid) {
            const homepagePosts = allBlogPosts
                .filter(b => b.display_on_homepage === true)
                .slice(0, 3);

            if (homepagePosts.length === 0) {
                const section = blogGrid.closest('.blog-section');
                if (section) section.style.display = 'none';
            } else {
                homepagePosts.forEach(post => {
                    blogGrid.appendChild(createBlogCard(post));
                });
            }
        }

        // Blog subpage grids (dynamic-blog-grid with data-category)
        document.querySelectorAll('.dynamic-blog-grid').forEach(grid => {
            const cat = grid.getAttribute('data-category');
            let filtered = allBlogPosts;
            if (cat) {
                filtered = filtered.filter(b => b.category === cat);
            }
            grid.innerHTML = '';
            filtered.forEach(post => {
                grid.appendChild(createBlogInnerCard(post));
            });
        });
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
    if (discountPercent > 0) {
        badgesHTML = '<div class="product-badges-container">';
        badgesHTML += `<span class="product-badge badge-sale">-${discountPercent}%</span>`;
        badgesHTML += '</div>';
    }

    // Format prices 
    const currentFormatted = formatPrice(product.current_price);
    const originalFormatted = product.original_price > product.current_price
        ? formatPrice(product.original_price) : '';

    card.innerHTML = `
        <div class="product-image-wrapper">
            ${badgesHTML}
            <a href="#/collections/products/entries/${product._slug}">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            </a>
            <div class="product-action-overlay">
                <a href="#/collections/products/entries/${product._slug}" class="btn btn-primary btn-buy" style="text-decoration: none; text-align: center;">XEM CHI TIẾT</a>
            </div>
        </div>
        <div class="product-info">
            <span class="product-vendor">${product.vendor || ''}</span>
            <a href="#/collections/products/entries/${product._slug}" style="text-decoration: none; color: inherit;">
                <h3 class="product-name">${product.title}</h3>
            </a>
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
            <a href="#/collections/blog/entries/${post._slug}">
                <img src="${post.thumbnail || ''}" alt="${post.title}" class="blog-image" loading="lazy">
            </a>
        </div>
        <div class="blog-category">${post.category || ''}</div>
        <a href="#/collections/blog/entries/${post._slug}" style="text-decoration: none; color: inherit;">
            <h3 class="blog-title">${post.title}</h3>
        </a>
        <p class="blog-excerpt">${post.excerpt || ''}</p>
        <div class="blog-footer">
            <span class="blog-date">${dateStr}</span>
            <span class="blog-read-time">5 phút đọc</span>
        </div>
    `;

    return card;
}

/**
 * Create a blog inner card for blog subpage grids.
 */
function createBlogInnerCard(post) {
    let dateStr = '';
    if (post.date) {
        const d = new Date(post.date);
        const months = ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
                        'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        dateStr = `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }

    const card = document.createElement('article');
    card.className = 'blog-inner-card';
    card.innerHTML = `
        <div class="blog-inner-image-wrapper">
            <span class="blog-inner-category">${post.category || ''}</span>
            <a href="#/collections/blog/entries/${post._slug}">
                <img src="${post.thumbnail || ''}" alt="${post.title}" class="blog-inner-image" loading="lazy">
            </a>
        </div>
        <div class="blog-inner-body">
            <a href="#/collections/blog/entries/${post._slug}" style="text-decoration:none;color:inherit;">
                <h3 class="blog-inner-title">${post.title}</h3>
            </a>
            <p class="blog-inner-excerpt">${post.excerpt || ''}</p>
        </div>
        <div class="blog-inner-footer">
            <span class="blog-inner-date">${dateStr}</span>
            <span class="blog-inner-readtime">5 phút đọc</span>
        </div>
    `;
    return card;
}

// =============================================================================
// ROUTER & CARDS MODULE
// =============================================================================

function createDealCard(product) {
    const currentFormatted = formatPrice(product.current_price);
    const originalFormatted = product.original_price > product.current_price ? formatPrice(product.original_price) : '';
    const discountPercent = product.original_price > product.current_price 
        ? Math.round((1 - product.current_price / product.original_price) * 100) : 0;

    return `
        <article class="deal-card">
            <div class="deal-card-image-wrapper">
                ${discountPercent > 0 ? `<span class="deal-card-badge badge-sale">-${discountPercent}%</span>` : ''}
                <a href="#/collections/products/entries/${product._slug}">
                    <img src="${product.image || ''}" alt="${product.title}" class="deal-card-image" loading="lazy">
                </a>
            </div>
            <div class="deal-card-body">
                <span class="deal-card-vendor">${product.vendor || 'MTH Beauty'}</span>
                <a href="#/collections/products/entries/${product._slug}" style="text-decoration:none; color:inherit;">
                    <h3 class="deal-card-title">${product.title}</h3>
                </a>
                <p class="deal-card-desc">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
            </div>
            <div class="deal-card-footer">
                <div class="deal-price-block">
                    ${originalFormatted ? `<span class="deal-price-original">${originalFormatted}</span>` : ''}
                    <span class="deal-price-current">${currentFormatted}</span>
                </div>
            </div>
        </article>
    `;
}

function handleRoute() {
    const hash = window.location.hash;
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('detail-view');
    
    if (hash.startsWith('#/collections/products/entries/')) {
        const slugWithQuery = hash.replace('#/collections/products/entries/', '');
        const slug = slugWithQuery.split('?')[0];
        renderProductDetail(slug);
        if (homeView) homeView.style.display = 'none';
        if (detailView) detailView.style.display = 'block';
        window.scrollTo(0, 0);
    } else if (hash.startsWith('#/collections/blog/entries/')) {
        const slugWithQuery = hash.replace('#/collections/blog/entries/', '');
        const slug = slugWithQuery.split('?')[0];
        renderBlogDetail(slug);
        if (homeView) homeView.style.display = 'none';
        if (detailView) detailView.style.display = 'block';
        window.scrollTo(0, 0);
    } else {
        // Home view
        if (homeView) homeView.style.display = 'block';
        if (detailView) {
            detailView.style.display = 'none';
            detailView.innerHTML = ''; // cleanup
        }
    }
}

window.addEventListener('hashchange', handleRoute);

async function renderProductDetail(slug) {
    const detailView = document.getElementById('detail-view');
    detailView.innerHTML = '<div style="padding: 100px; text-align: center; color: var(--gold-light);">Đang tải thông tin...</div>';
    
    const product = await fetchJSON(`/data/products/${slug}.json`);
    if (!product) {
        detailView.innerHTML = '<div style="padding: 100px; text-align: center; color: var(--text-dark);"><h3>Sản phẩm không tồn tại</h3><a href="#/" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Quay lại trang chủ</a></div>';
        return;
    }
    product._slug = slug;
    
    let discountPercent = 0;
    if (product.original_price && product.current_price && product.original_price > product.current_price) {
        discountPercent = Math.round((1 - product.current_price / product.original_price) * 100);
    }
    
    const currentFormatted = formatPrice(product.current_price);
    const originalFormatted = product.original_price > product.current_price ? formatPrice(product.original_price) : '';
    
    // Render detail_description (markdown → HTML)
    let detailDescHTML = '';
    if (product.detail_description) {
        detailDescHTML = `
            <div class="detail-full-description">
                <h2 class="detail-section-heading">Thông tin chi tiết</h2>
                <div class="detail-markdown-content">${simpleMarkdown(product.detail_description)}</div>
            </div>`;
    }
    
    document.title = `${product.title} | MTH Beauty`;
    
    detailView.innerHTML = `
        <div class="product-detail-layout container">
            <div class="product-detail-image-sec">
                <div class="product-detail-image-wrapper">
                    ${discountPercent > 0 ? `<span class="detail-badge badge-sale">-${discountPercent}%</span>` : ''}
                    <img src="${product.image}" alt="${product.title}">
                </div>
            </div>
            <div class="product-detail-info-sec">
                <nav class="breadcrumb">
                    <a href="#/">Trang chủ</a> <span class="divider">/</span> <span>Sản phẩm</span>
                </nav>
                <div class="detail-vendor">${product.vendor || 'MTH Beauty'}</div>
                <h1 class="detail-title">${product.title}</h1>
                <div class="detail-price-row">
                    <span class="detail-price-current">${currentFormatted}</span>
                    ${originalFormatted ? `<span class="detail-price-old">${originalFormatted}</span>` : ''}
                </div>
                <div class="detail-description">
                    ${product.description ? `<p>${product.description.replace(/\\n/g, '<br>')}</p>` : ''}
                </div>
                <div class="detail-actions">
                    <button class="btn btn-primary btn-order-now" id="btn-order-now">ĐẶT HÀNG NGAY</button>
                    <button class="btn btn-outline btn-wishlist" aria-label="Thêm mục yêu thích">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                </div>
                <div class="detail-policies">
                    <div class="policy-item">
                        <span class="policy-icon">✓</span> Tự hào phân phối chính hãng 100%
                    </div>
                    <div class="policy-item">
                        <span class="policy-icon">✓</span> Giao hàng siêu tốc trong 2h tại TP.HCM
                    </div>
                    <div class="policy-item">
                        <span class="policy-icon">✓</span> Tích điểm 5% cho thành viên V.I.P
                    </div>
                </div>
                ${detailDescHTML}
            </div>
        </div>
    `;
    
    // Wire up the order button
    const orderBtn = document.getElementById('btn-order-now');
    if (orderBtn) {
        orderBtn.addEventListener('click', () => handleOrderClick(product));
    }
}

async function renderBlogDetail(slug) {
    const detailView = document.getElementById('detail-view');
    detailView.innerHTML = '<div style="padding: 100px; text-align: center; color: var(--gold-light);">Đang tải bài viết...</div>';
    
    const post = await fetchJSON(`/data/blog/${slug}.json`);
    if (!post) {
        detailView.innerHTML = '<div style="padding: 100px; text-align: center; color: var(--text-dark);"><h3>Bài viết không tồn tại</h3><a href="/#/" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Quay lại trang chủ</a></div>';
        return;
    }
    
    let dateStr = '';
    if (post.date) {
        const d = new Date(post.date);
        const months = ['Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
                        'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        dateStr = `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
    }
    
    document.title = `${post.title} | MTH Beauty`;
    
    let bodyHTML = post.body || '';
    bodyHTML = bodyHTML.replace(/\\n\\n/g, '</p><p>').replace(/\\n/g, '<br>');
    if (!bodyHTML.startsWith('<p>')) bodyHTML = '<p>' + bodyHTML + '</p>';
    
    detailView.innerHTML = `
        <article class="blog-detail-layout container">
            <header class="blog-detail-header">
                <nav class="breadcrumb">
                    <a href="#/">Trang chủ</a> <span class="divider">/</span> <span>Blog</span> <span class="divider">/</span> <span>${post.category || 'Tin tức'}</span>
                </nav>
                <div class="blog-detail-meta">
                    <span class="tag-category">${post.category || ''}</span>
                    <span class="tag-date">${dateStr}</span>
                </div>
                <h1 class="blog-detail-title">${post.title}</h1>
                ${post.excerpt ? `<p class="blog-detail-excerpt">${post.excerpt}</p>` : ''}
            </header>
            ${post.thumbnail ? `
            <figure class="blog-detail-hero">
                <img src="${post.thumbnail}" alt="${post.title}">
            </figure>` : ''}
            <div class="blog-detail-content">
                ${bodyHTML}
            </div>
        </article>
    `;
}

// =============================================================================
// ORDER SYSTEM MODULE
// =============================================================================

/**
 * Handle the "ĐẶT HÀNG NGAY" button click.
 * If product has shopee_link → open Shopee + record click.
 * Otherwise → show order form modal.
 */
function handleOrderClick(product) {
    if (product.shopee_link && product.shopee_link.trim() !== '') {
        // Open Shopee in new tab
        window.open(product.shopee_link, '_blank');
        // Record the click
        recordShopeeClick(product);
    } else {
        // Show order form
        showOrderModal(product);
    }
}

/**
 * Record a Shopee redirect click to Google Sheet.
 */
function recordShopeeClick(product) {
    const data = {
        type: 'shopee_click',
        product_name: product.title,
        product_slug: product._slug || '',
        shopee_link: product.shopee_link,
        price: product.current_price,
        timestamp: new Date().toISOString()
    };
    
    if (ORDER_SCRIPT_URL && !ORDER_SCRIPT_URL.includes('REPLACE_WITH')) {
        fetch(ORDER_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.warn('Shopee click tracking failed:', err));
    }
}

/**
 * Show the order form modal for direct ordering.
 */
function showOrderModal(product) {
    // Remove existing modal if any
    const existing = document.getElementById('order-modal-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'order-modal-overlay';
    overlay.className = 'order-modal-overlay';
    
    overlay.innerHTML = `
        <div class="order-modal">
            <button class="order-modal-close" id="order-modal-close" aria-label="Đóng">&times;</button>
            <div class="order-modal-header">
                <h2 class="order-modal-title">Đặt Hàng</h2>
                <p class="order-modal-product-name">${product.title}</p>
                <p class="order-modal-price">${formatPrice(product.current_price)}</p>
            </div>
            <form id="order-form" class="order-form">
                <div class="order-form-group">
                    <label for="order-name">Họ tên <span class="required">*</span></label>
                    <input type="text" id="order-name" name="name" required placeholder="Nhập họ tên đầy đủ">
                </div>
                <div class="order-form-group">
                    <label for="order-phone">Số điện thoại <span class="required">*</span></label>
                    <input type="tel" id="order-phone" name="phone" required placeholder="0912 345 678">
                </div>
                <div class="order-form-group">
                    <label for="order-address">Địa chỉ <span class="required">*</span></label>
                    <textarea id="order-address" name="address" required placeholder="Nhập địa chỉ nhận hàng để giao hàng chính xác" rows="2"></textarea>
                    <span class="order-field-hint">Cần địa chỉ chi tiết để giao hàng đúng nơi</span>
                </div>
                <div class="order-form-row">
                    <div class="order-form-group">
                        <label for="order-birthday">Sinh nhật <span class="required">*</span></label>
                        <input type="date" id="order-birthday" name="birthday" required>
                    </div>
                    <div class="order-form-group">
                        <label for="order-quantity">Số lượng <span class="required">*</span></label>
                        <input type="number" id="order-quantity" name="quantity" min="1" value="1" required>
                    </div>
                </div>
                <div class="order-form-group">
                    <label for="order-note">Cảm nhận / Thắc mắc <span class="optional">(tùy chọn)</span></label>
                    <textarea id="order-note" name="note" placeholder="Chia sẻ cảm nhận hoặc câu hỏi của bạn..." rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-submit-order" id="btn-submit-order">XÁC NHẬN ĐẶT HÀNG</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    // Close handlers
    document.getElementById('order-modal-close').addEventListener('click', closeOrderModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOrderModal();
    });
    
    // Form submit
    document.getElementById('order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        submitOrder(product);
    });
}

function closeOrderModal() {
    const overlay = document.getElementById('order-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

/**
 * Submit order data to Google Apps Script.
 */
async function submitOrder(product) {
    const form = document.getElementById('order-form');
    const submitBtn = document.getElementById('btn-submit-order');
    const originalText = submitBtn.textContent;
    
    // Disable button during submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    
    const data = {
        type: 'order',
        product_name: product.title,
        product_slug: product._slug || '',
        product_price: product.current_price,
        name: document.getElementById('order-name').value.trim(),
        phone: document.getElementById('order-phone').value.trim(),
        address: document.getElementById('order-address').value.trim(),
        birthday: document.getElementById('order-birthday').value,
        quantity: parseInt(document.getElementById('order-quantity').value) || 1,
        note: document.getElementById('order-note').value.trim(),
        timestamp: new Date().toISOString()
    };
    
    try {
        if (ORDER_SCRIPT_URL && !ORDER_SCRIPT_URL.includes('REPLACE_WITH')) {
            await fetch(ORDER_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        // Show success state
        const modal = document.querySelector('.order-modal');
        if (modal) {
            modal.innerHTML = `
                <div class="order-success">
                    <div class="order-success-icon">✓</div>
                    <h2 class="order-success-title">Đặt Hàng Thành Công!</h2>
                    <p class="order-success-msg">Cảm ơn <strong>${data.name}</strong> đã tin tưởng Mai Trinh Hồ.<br>Chúng tôi sẽ liên hệ bạn qua số <strong>${data.phone}</strong> trong thời gian sớm nhất.</p>
                    <button class="btn btn-primary" onclick="closeOrderModal()" style="margin-top: 24px;">ĐÓNG</button>
                </div>
            `;
        }
    } catch (err) {
        console.warn('Order submission failed:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        alert('Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline.');
    }
}

/**
 * Convert simple markdown to HTML (for detail_description).
 */
function simpleMarkdown(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    if (!html.startsWith('<h') && !html.startsWith('<ul')) {
        html = '<p>' + html + '</p>';
    }
    return html;
}

// =============================================================================
// ANNOUNCEMENT BAR — Dynamic CMS Content
// =============================================================================
async function initAnnouncementBar() {
    try {
        const data = await fetchJSON('/data/announcement-bar.json');
        if (!data || data.visible === false) return;

        const bar = document.querySelector('.announcement-bar');
        if (!bar) return;

        let content = data.text || '';
        if (data.highlight) {
            content += ` <span class="announcement-highlight">${data.highlight}</span>`;
        }

        if (data.link && data.link.trim() !== '') {
            bar.innerHTML = `<a href="${data.link}" style="color:inherit;text-decoration:none;"><span>${content}</span></a>`;
            bar.style.cursor = 'pointer';
        } else {
            bar.innerHTML = `<span>${content}</span>`;
        }
    } catch (err) {
        console.warn('Announcement bar load failed:', err);
    }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Fetch and parse a JSON file. Returns null on failure.
 * Bắt buộc tải mới tất cả file JSON để tránh lỗi cache
 */
async function fetchJSON(url) {
    try {
        const timestamp = new Date().getTime();
        const fetchUrl = url.includes('?') ? `${url}&_t=${timestamp}` : `${url}?_t=${timestamp}`;
        const res = await fetch(fetchUrl);
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
