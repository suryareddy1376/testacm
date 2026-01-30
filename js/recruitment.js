// ===== DOM Elements =====
const darkModeToggle = document.getElementById('darkModeToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const recruitmentForm = document.getElementById('recruitmentForm');

// ===== Dark Mode Toggle =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light';
    } else {
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

// Close mobile menu when clicking on a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== Form Handling =====
recruitmentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(recruitmentForm);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });
    
    // Form validation
    if (!validateForm(data)) {
        return;
    }
    
    // Simulate form submission
    const submitBtn = recruitmentForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showSuccessMessage();
        
        // Reset form
        recruitmentForm.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Log form data (for demonstration)
        console.log('Form submitted:', data);
    }, 2000);
});

function validateForm(data) {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showError('Please enter a valid email address.');
        return false;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        showError('Please enter a valid 10-digit phone number.');
        return false;
    }
    
    // Check terms
    if (!data.terms) {
        showError('Please agree to the terms and conditions.');
        return false;
    }
    
    return true;
}

function showError(message) {
    // Remove existing error
    const existingError = document.querySelector('.form-error');
    if (existingError) existingError.remove();
    
    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
        background: #e74c3c;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        animation: fadeIn 0.3s ease;
    `;
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Insert before form
    recruitmentForm.parentNode.insertBefore(errorDiv, recruitmentForm);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccessMessage() {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-success');
    if (existingMessage) existingMessage.remove();
    
    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success show';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Application Submitted Successfully!</h3>
        <p>Thank you for applying to KARE ACM SIGBED. We will review your application and get back to you soon.</p>
    `;
    
    // Insert before form
    recruitmentForm.parentNode.insertBefore(successDiv, recruitmentForm);
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ===== Input Formatting =====
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    // Remove non-numeric characters
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    e.target.value = value;
});

// ===== Animation on Scroll =====
function animateOnScroll() {
    const elements = document.querySelectorAll('.info-card, .timeline-item, .contact-card');
    
    elements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initial styles for animation
document.querySelectorAll('.info-card, .timeline-item, .contact-card').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
});

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// ===== Navbar Background on Scroll =====
const mainNav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        mainNav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        mainNav.style.boxShadow = 'var(--shadow)';
    }
});
