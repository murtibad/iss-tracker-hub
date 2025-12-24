// src/ui/components/toastManager.js
// Accessible Toast Notification System
// Features: ARIA-live, High Contrast, 18px+ Typography, Auto-dismiss

export function showToast(message, type = 'info', duration = 4000) {
    // 1. Create container if not exists
    let container = document.getElementById('hub-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'hub-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 100px; /* Above bottom nav */
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 9999;
            pointer-events: none; /* Allow clicks through gaps */
            width: 90%;
            max-width: 400px;
        `;
        document.body.appendChild(container); // Append to body, not rootEl, to ensure top z-index
    }

    // 2. Create Toast Element
    const toast = document.createElement('div');
    toast.className = `hub-toast hub-toast-${type}`;

    // Accessibility: ARIA
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    // Styles: High Contrast, 18px+
    const bg = type === 'error' ? '#ef4444' : '#fcd34d'; // Red or Gold
    const color = '#000000'; // Black text for max contrast
    const icon = type === 'error' ? '⚠️' : '✅';

    toast.style.cssText = `
        background: ${bg};
        color: ${color};
        font-size: 18px; /* Strict 18px */
        font-weight: 700;
        padding: 16px 24px;
        border-radius: 99px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: auto;
        cursor: pointer;
        text-align: center;
        justify-content: center;
    `;

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    // 3. Append & Animate
    container.appendChild(toast);

    // Trigger reflow for transition
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    // 4. Dismiss Logic
    const dismiss = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    };

    // Click to dismiss
    toast.onclick = dismiss;

    // Auto dismiss
    setTimeout(dismiss, duration);
}

// Global exposure for easy access if needed (optional)
window.showHubToast = showToast;
