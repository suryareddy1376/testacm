// ===== DOM Elements =====
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const pauseAnnouncementBtn = document.getElementById('pauseAnnouncement');

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
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
}

darkModeToggle.addEventListener('click', toggleDarkMode);

// ===== Mobile Menu Toggle =====
mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

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
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.createDots();
        this.startAutoPlay();
        this.setupControls();
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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Active Navigation Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function highlightNavOnScroll() {
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
}

window.addEventListener('scroll', highlightNavOnScroll);

// ===== Navbar Background on Scroll =====
const mainNav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        mainNav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        mainNav.style.boxShadow = 'var(--shadow)';
    }
});

// ===== Animation on Scroll =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.offer-card, .representative-card, .about-card, .partner-link');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initial styles for animation
document.querySelectorAll('.offer-card, .representative-card, .about-card, .partner-link').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);
