// ===== DOM Elements =====
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const pauseAnnouncementBtn = document.getElementById('pauseAnnouncement');

// ===== Page Loading Handler =====
const pageLoader = document.querySelector('.page-loader');

function hidePageLoader() {
    if (pageLoader) {
        pageLoader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            if (pageLoader.parentNode) {
                pageLoader.style.display = 'none';
            }
        }, 500);
    }
}

// Hide loader when page is fully loaded
window.addEventListener('load', () => {
    hidePageLoader();
});

// Fallback - hide loader after 3 seconds max
setTimeout(hidePageLoader, 3000);

// ===== Lazy Loading Images =====
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => {
            img.classList.add('lazy-image');
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => loadImage(img));
    }
}

function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;
    
    img.src = src;
    img.removeAttribute('data-src');
    
    img.onload = () => {
        img.classList.add('loaded');
    };
    
    img.onerror = () => {
        img.classList.add('loaded');
        // Set placeholder on error
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle"%3EImage unavailable%3C/text%3E%3C/svg%3E';
    };
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);

// ===== Network Status Handler =====
function updateNetworkStatus() {
    if (!navigator.onLine) {
        showToast('You are offline. Some features may be unavailable.', 'warning');
    }
}

window.addEventListener('online', () => {
    showToast('Back online!', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are offline.', 'warning');
});

// ===== Toast Notification System =====
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Apply styles
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: '10000',
        animation: 'slideUp 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add toast animations to page
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

// ===== Dark Mode Toggle =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const icon = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark';
    }
}

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
}

if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);

// ===== Mobile Menu Toggle =====
if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        // Toggle hamburger icon
        const icon = mobileMenuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenuToggle.querySelector('i').classList.remove('fa-times');
            mobileMenuToggle.querySelector('i').classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.querySelector('i').classList.remove('fa-times');
            mobileMenuToggle.querySelector('i').classList.add('fa-bars');
            document.body.style.overflow = '';
        }
    });
}

// ===== Dropdown Menu Toggle for Mobile =====
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            // Check if we're on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Close mobile menu when clicking on a regular link (not dropdown toggle)
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        // Only close menu if it's not a dropdown toggle
        if (!link.classList.contains('dropdown-toggle')) {
            navLinks.classList.remove('active');
        }
    });
});

// ===== Hero Slider =====
class Slider {
    constructor(containerSelector, slideSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.slides = document.querySelectorAll(slideSelector);
        this.currentIndex = 0;
        this.autoPlayInterval = options.autoPlay || 5000;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.createDots();
        this.startAutoPlay();
        this.setupControls();
        this.setupTouchEvents();
    }
    
    createDots() {
        const dotsContainer = this.container.querySelector('.slider-dots');
        if (dotsContainer) {
            this.slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('slider-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }
    }
    
    setupControls() {
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    }
    
    setupTouchEvents() {
        if (!this.container) return;
        
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.pauseAutoPlay();
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.resetAutoPlay();
        }, { passive: true });
    }
    
    handleSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        }
    }
    
    goToSlide(index) {
        this.slides[this.currentIndex].classList.remove('active');
        const dots = this.container.querySelectorAll('.slider-dot');
        if (dots[this.currentIndex]) dots[this.currentIndex].classList.remove('active');
        
        this.currentIndex = index;
        if (this.currentIndex >= this.slides.length) this.currentIndex = 0;
        if (this.currentIndex < 0) this.currentIndex = this.slides.length - 1;
        
        this.slides[this.currentIndex].classList.add('active');
        if (dots[this.currentIndex]) dots[this.currentIndex].classList.add('active');
        
        this.resetAutoPlay();
    }
    
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    startAutoPlay() {
        this.autoPlayTimer = setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }
    
    pauseAutoPlay() {
        clearInterval(this.autoPlayTimer);
    }
    
    resetAutoPlay() {
        clearInterval(this.autoPlayTimer);
        this.startAutoPlay();
    }
}

// Initialize Hero Slider
const heroSlider = new Slider('.hero-section', '.slide', { autoPlay: 5000 });

// ===== News Slider =====
class SimpleSlider {
    constructor(containerSelector, slideSelector, prevSelector, nextSelector, autoPlayInterval = 5000) {
        this.container = document.querySelector(containerSelector);
        this.slides = document.querySelectorAll(slideSelector);
        this.prevBtn = document.querySelector(prevSelector);
        this.nextBtn = document.querySelector(nextSelector);
        this.currentIndex = 0;
        this.autoPlayInterval = autoPlayInterval;
        this.autoPlayTimer = null;
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        this.startAutoPlay();
    }
    
    goTo(index) {
        this.slides[this.currentIndex].classList.remove('active');
        this.currentIndex = index;
        if (this.currentIndex >= this.slides.length) this.currentIndex = 0;
        if (this.currentIndex < 0) this.currentIndex = this.slides.length - 1;
        this.slides[this.currentIndex].classList.add('active');
        this.resetAutoPlay();
    }
    
    next() {
        this.goTo(this.currentIndex + 1);
    }
    
    prev() {
        this.goTo(this.currentIndex - 1);
    }
    
    startAutoPlay() {
        this.autoPlayTimer = setInterval(() => this.next(), this.autoPlayInterval);
    }
    
    resetAutoPlay() {
        clearInterval(this.autoPlayTimer);
        this.startAutoPlay();
    }
}

// Initialize News Slider
const newsSlider = new SimpleSlider('.news-slider', '.news-slide', '.prev-news', '.next-news', 4000);

// Initialize Testimonials Slider
const testimonialSlider = new SimpleSlider('.testimonials-slider', '.testimonial-slide', '.prev-testimonial', '.next-testimonial', 6000);

// ===== Announcement Ticker =====
let isAnnouncementPaused = false;
const tickerContent = document.querySelector('.ticker-content');

pauseAnnouncementBtn.addEventListener('click', () => {
    isAnnouncementPaused = !isAnnouncementPaused;
    tickerContent.classList.toggle('paused');
    
    if (isAnnouncementPaused) {
        pauseAnnouncementBtn.innerHTML = '<i class="fas fa-play"></i> Play Announcements';
    } else {
        pauseAnnouncementBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Announcements';
    }
});

// ===== Calendar =====
function generateCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    if (!calendarBody) return;
    
    const today = new Date();
    const year = 2026;
    const month = 0; // January (0-indexed)
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    calendarBody.innerHTML = '';
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        dayElement.textContent = prevMonthLastDay - i;
        calendarBody.appendChild(dayElement);
    }
    
    // Current month days
    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = day;
        
        const dayOfWeek = new Date(year, month, day).getDay();
        if (dayOfWeek === 0) {
            dayElement.classList.add('sunday');
        }
        
        // Mark today
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        calendarBody.appendChild(dayElement);
    }
    
    // Next month days
    const remainingDays = 42 - (startingDay + totalDays);
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day', 'other-month');
        dayElement.textContent = day;
        calendarBody.appendChild(dayElement);
    }
}

generateCalendar();

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.querySelector('i').classList.remove('fa-times');
                    mobileMenuToggle.querySelector('i').classList.add('fa-bars');
                }
                document.body.style.overflow = '';
            }
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Debounce utility for scroll events =====
function debounce(func, wait = 10) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Throttle utility for scroll events =====
function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Active Navigation Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const highlightNavOnScroll = throttle(() => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}, 100);

window.addEventListener('scroll', highlightNavOnScroll, { passive: true });

// ===== Navbar Background on Scroll =====
const mainNav = document.querySelector('.main-nav');

const handleNavScroll = throttle(() => {
    if (mainNav) {
        if (window.scrollY > 50) {
            mainNav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            mainNav.style.boxShadow = 'var(--shadow)';
        }
    }
}, 50);

window.addEventListener('scroll', handleNavScroll, { passive: true });

// ===== Animation on Scroll with Intersection Observer =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.offer-card, .representative-card, .about-card, .partner-link, .team-card');
    
    if ('IntersectionObserver' in window) {
        // Set initial styles
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(element => animationObserver.observe(element));
    } else {
        // Fallback - show all elements immediately
        animatedElements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// ===== Handle resize events =====
const handleResize = debounce(() => {
    // Close mobile menu on resize to desktop
    if (window.innerWidth > 768 && navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (mobileMenuToggle) {
            mobileMenuToggle.querySelector('i').classList.remove('fa-times');
            mobileMenuToggle.querySelector('i').classList.add('fa-bars');
        }
        document.body.style.overflow = '';
    }
}, 150);

window.addEventListener('resize', handleResize, { passive: true });

// ===== Visibility API - pause animations when tab not visible =====
document.addEventListener('visibilitychange', () => {
    const tickerContent = document.querySelector('.ticker-content');
    if (document.hidden) {
        // Page is hidden - pause animations to save resources
        if (tickerContent) tickerContent.style.animationPlayState = 'paused';
        if (heroSlider) heroSlider.pauseAutoPlay();
    } else {
        // Page is visible - resume animations
        if (tickerContent && !tickerContent.classList.contains('paused')) {
            tickerContent.style.animationPlayState = 'running';
        }
        if (heroSlider) heroSlider.resetAutoPlay();
    }
});
window.addEventListener('load', animateOnScroll);
