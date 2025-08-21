// Empire Domination Theme JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSmoothScrolling();
    initScrollAnimations();
    initNavScrollEffect();
    initStatsAnimation();
    initProductForms();
    initImageGallery();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Navigation scroll effect
function initNavScrollEffect() {
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.9)';
            }
        }
    });
}

// Stats counter animation
function initStatsAnimation() {
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const range = target - start;
        const increment = target > 0 ? 1 : -1;
        const step = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            const suffix = element.textContent.includes('%') ? '%' : 
                         element.textContent.includes('+') ? '+' : '';
            element.textContent = current + suffix;
            if (current === target) {
                clearInterval(timer);
            }
        }, step);
    }

    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numbers = entry.target.querySelectorAll('.stat-number');
                numbers.forEach(num => {
                    const originalText = num.textContent;
                    const target = parseInt(originalText.replace(/[^0-9]/g, ''));
                    if (target && !num.classList.contains('animated')) {
                        num.classList.add('animated');
                        animateCounter(num, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

// Product form handling
function initProductForms() {
    // Add to cart functionality
    document.querySelectorAll('.product-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const button = this.querySelector('.btn-add-to-cart');
            const originalText = button.querySelector('.btn-text').textContent;
            
            // Show loading state
            button.disabled = true;
            button.querySelector('.btn-text').textContent = 'Adding to Empire...';
            
            fetch('/cart/add.js', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Success feedback
                button.querySelector('.btn-text').textContent = 'Added to Empire! 👑';
                setTimeout(() => {
                    button.disabled = false;
                    button.querySelector('.btn-text').textContent = originalText;
                }, 2000);
                
                // Update cart count if element exists
                updateCartCount();
                
                // Optional: Show mini cart or redirect
                showAddToCartSuccess(data);
            })
            .catch(error => {
                console.error('Error:', error);
                button.disabled = false;
                button.querySelector('.btn-text').textContent = 'Error - Try Again';
                setTimeout(() => {
                    button.querySelector('.btn-text').textContent = originalText;
                }, 2000);
            });
        });
    });
    
    // Variant selection handling
    document.querySelectorAll('.variant-select').forEach(select => {
        select.addEventListener('change', updateProductVariant);
    });
}

// Update product variant
function updateProductVariant() {
    const form = this.closest('.product-form');
    if (!form) return;
    
    const selects = form.querySelectorAll('.variant-select');
    const options = Array.from(selects).map(s => s.value);
    
    // Get product variants (should be available in product template)
    if (typeof productVariants !== 'undefined') {
        const variant = productVariants.find(v => {
            return options.every((option, index) => v.options[index] === option);
        });
        
        if (variant) {
            // Update hidden input
            const idInput = form.querySelector('input[name="id"]');
            if (idInput) {
                idInput.value = variant.id;
            }
            
            // Update price display
            const priceElement = form.closest('.product-info').querySelector('.price');
            if (priceElement) {
                priceElement.textContent = formatMoney(variant.price);
            }
            
            // Update buttons
            const addButton = form.querySelector('.btn-add-to-cart');
            const buyButton = form.querySelector('.btn-buy-now');
            
            if (variant.available) {
                addButton.disabled = false;
                addButton.querySelector('.btn-text').textContent = `Dominate Now - ${formatMoney(variant.price)}`;
                if (buyButton) buyButton.disabled = false;
            } else {
                addButton.disabled = true;
                addButton.querySelector('.btn-text').textContent = 'Sold Out';
                if (buyButton) buyButton.disabled = true;
            }
        }
    }
}

// Image gallery functionality
function initImageGallery() {
    document.querySelectorAll('.product-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const mainImage = document.querySelector('.product-main-image');
            if (mainImage) {
                const newSrc = this.src.replace('_200x200', '_800x800');
                mainImage.src = newSrc;
                
                // Update active thumbnail
                document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Utility functions
function formatMoney(cents) {
    const currency = window.theme?.settings?.moneyFormat || '${{amount}}';
    const amount = (cents / 100).toFixed(2);
    return currency.replace('{{amount}}', amount);
}

function updateCartCount() {
    fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.item_count;
            cartCount.style.display = cart.item_count > 0 ? 'inline' : 'none';
        }
    });
}

function showAddToCartSuccess(product) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">👑</span>
            <div class="notification-text">
                <strong>Added to Empire!</strong>
                <p>${product.product_title}</p>
            </div>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(45deg, #FFD700, #FFA500);
        color: #000;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Buy now functionality
function buyNow() {
    const form = document.querySelector('.product-form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    fetch('/cart/add.js', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = '/checkout';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error adding to cart. Please try again.');
    });
}

// Product card interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('product-btn')) {
        e.preventDefault();
        const productTitle = e.target.closest('.product-card').querySelector('.product-title').textContent;
        
        // Track product interest (integrate with your analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'product_interest', {
                'event_category': 'Empire Products',
                'event_label': productTitle
            });
        }
        
        // Handle product link
        const href = e.target.getAttribute('href');
        if (href && href !== '#') {
            window.location.href = href;
        } else {
            alert(`Ready to dominate with ${productTitle}? Redirecting to product page...`);
        }
    }
});

// Form validation and enhancement
document.querySelectorAll('input[required]').forEach(input => {
    input.addEventListener('invalid', function(e) {
        e.preventDefault();
        this.classList.add('error');
        
        // Custom validation messages
        const customMessages = {
            email: 'Enter your empire email address',
            text: 'This field is required for domination',
            number: 'Enter a valid number'
        };
        
        const message = customMessages[this.type] || 'This field is required';
        this.setCustomValidity(message);
        
        // Remove error class when valid
        this.addEventListener('input', function() {
            if (this.validity.valid) {
                this.classList.remove('error');
                this.setCustomValidity('');
            }
        });
    });
});

// Search functionality enhancement
const searchInput = document.querySelector('input[type="search"]');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 2) {
            // Implement live search suggestions
            fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`)
            .then(response => response.json())
            .then(data => {
                // Show search suggestions
                showSearchSuggestions(data.resources.results.products, this);
            });
        }
    });
}

function showSearchSuggestions(products, input) {
    // Remove existing suggestions
    const existing = document.querySelector('.search-suggestions');
    if (existing) existing.remove();
    
    if (products.length === 0) return;
    
    // Create suggestions dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #1a1a1a;
        border: 1px solid #FFD700;
        border-radius: 10px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
    `;
    
    products.forEach(product => {
        const item = document.createElement('a');
        item.href = product.url;
        item.className = 'suggestion-item';
        item.style.cssText = `
            display: flex;
            padding: 15px;
            color: #fff;
            text-decoration: none;
            border-bottom: 1px solid rgba(255,215,0,0.2);
            transition: background 0.3s ease;
        `;
        
        item.innerHTML = `
            <div class="suggestion-content">
                <strong>${product.title}</strong>
                <div style="color: #FFD700; font-size: 0.9em;">${formatMoney(product.price)}</div>
            </div>
        `;
        
        item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(255,215,0,0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = '';
        });
        
        dropdown.appendChild(item);
    });
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(dropdown);
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function closeSearch(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeSearch);
        }
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: #FFD700;
        font-size: 1.5em;
        cursor: pointer;
    `;
    
    const nav = document.querySelector('.nav-container');
    const navLinks = document.querySelector('.nav-links');
    
    if (nav && navLinks) {
        nav.appendChild(mobileToggle);
        
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
        });
    }
}

// Newsletter signup enhancement
document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = this.querySelector('input[type="email"]').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Joining Empire...';
        submitBtn.disabled = true;
        
        // Simulate newsletter signup (replace with actual implementation)
        setTimeout(() => {
            submitBtn.textContent = 'Welcome to the Empire! 👑';
            submitBtn.style.background = '#4CAF50';
            
            // Reset after delay
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                this.reset();
            }, 3000);
        }, 1500);
    });
});

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Performance optimization
function optimizePerformance() {
    // Debounce scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.onscroll = function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            if (originalScrollHandler) originalScrollHandler();
        }, 16); // ~60fps
    };
    
    // Preload critical resources
    const criticalImages = document.querySelectorAll('.hero img, .product-card img');
    criticalImages.forEach(img => {
        if (img.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = img.src;
            link.as = 'image';
            document.head.appendChild(link);
        }
    });
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initLazyLoading();
    optimizePerformance();
});

// Export functions for global access
window.EmpireDomination = {
    buyNow,
    formatMoney,
    updateCartCount,
    showAddToCartSuccess
};