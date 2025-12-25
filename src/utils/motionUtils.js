// src/utils/motionUtils.js
// TR: Animasyon yardımcı fonksiyonları - mikro etkileşimler ve smooth geçişler
// EN: Animation utility functions - micro-interactions and smooth transitions

/**
 * Animate numeric value with easing (count-up effect)
 * @param {HTMLElement} el - Element to update
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Optional suffix (e.g., 'km', '%')
 * @param {number} decimals - Decimal places
 */
export function animateValue(el, start, end, duration = 500, suffix = '', decimals = 0) {
    if (!el) return;

    const startTime = performance.now();
    const diff = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + diff * eased;

        el.textContent = current.toFixed(decimals) + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Smooth interpolation between values
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(current, target, factor = 0.1) {
    return current + (target - current) * factor;
}

/**
 * Add entrance animation to element
 * @param {HTMLElement} el - Element to animate
 * @param {string} type - Animation type: 'fade', 'slide-up', 'slide-left', 'scale'
 * @param {number} delay - Delay in ms
 * @param {number} duration - Duration in ms
 */
export function animateEntrance(el, type = 'fade', delay = 0, duration = 400) {
    if (!el) return;

    // Initial state
    el.style.opacity = '0';
    el.style.transition = 'none';

    switch (type) {
        case 'slide-up':
            el.style.transform = 'translateY(20px)';
            break;
        case 'slide-left':
            el.style.transform = 'translateX(20px)';
            break;
        case 'slide-down':
            el.style.transform = 'translateY(-20px)';
            break;
        case 'scale':
            el.style.transform = 'scale(0.9)';
            break;
        default:
            el.style.transform = 'none';
    }

    // Trigger animation after delay
    setTimeout(() => {
        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        el.style.opacity = '1';
        el.style.transform = 'none';
    }, delay);
}

/**
 * Setup intersection observer for scroll reveal animations
 * @param {string} selector - CSS selector for elements to observe
 * @param {Object} options - Observer options
 */
export function setupScrollReveal(selector, options = {}) {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        animationType = 'fade',
        staggerDelay = 100,
        once = true
    } = options;

    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        elements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = index * staggerDelay;
                animateEntrance(entry.target, animationType, delay);
                entry.target.classList.add('revealed');

                if (once) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold, rootMargin });

    elements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    return observer;
}

/**
 * Create ripple effect on click
 * @param {HTMLElement} el - Element to add ripple to
 * @param {MouseEvent} event - Click event
 */
export function createRipple(el, event) {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--accent);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple-expand 0.5s ease-out forwards;
    pointer-events: none;
    opacity: 0.4;
    left: ${x}px;
    top: ${y}px;
  `;

    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
}

/**
 * Debounced resize handler for responsive animations
 * @param {Function} callback - Callback function
 * @param {number} delay - Debounce delay
 */
export function onResizeDebounced(callback, delay = 250) {
    let timer;
    window.addEventListener('resize', () => {
        clearTimeout(timer);
        timer = setTimeout(callback, delay);
    });
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion preferred
 */
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply staggered animation to multiple elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {string} animationType - Animation type
 * @param {number} staggerDelay - Delay between each element
 */
export function staggeredEntrance(elements, animationType = 'slide-up', staggerDelay = 80) {
    if (prefersReducedMotion()) {
        elements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    elements.forEach((el, i) => {
        animateEntrance(el, animationType, i * staggerDelay);
    });
}

/**
 * CSS for ripple animation (add to animations.css)
 */
export const RIPPLE_CSS = `
@keyframes ripple-expand {
  to {
    transform: translate(-50%, -50%) scale(40);
    opacity: 0;
  }
}
`;
