/**
 * Main Application Logic
 * Standard: Vanilla JS chuyên nghiệp
 * Mobile-First: Tối ưu UX cho thiết bị cảm ứng
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
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeMenu() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Close all open dropdowns
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
                // Only enable accordion on mobile (≤768px)
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    // Close other open items for accordion behavior
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
});
