// src/services/passNotification.js
// ISS Pass Notification Service - Calendar export and browser notifications

import { getUser } from './authService.js';
import { getPreferences, setPassNotifications } from './userPreferences.js';
import { t, getCurrentLanguage } from '../i18n/i18n.js';

// Generate ICS file content for calendar
function generateICS(pass) {
    if (!pass || !pass.startTime) return null;

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const startDate = new Date(pass.startTime);
    const endDate = new Date(startDate.getTime() + (pass.duration || 5) * 60 * 1000);
    const now = new Date();

    const lang = getCurrentLanguage();
    const title = t('notify.title') || "ISS Tracker Hub";
    const description = lang === 'tr'
        ? `Uluslararası Uzay İstasyonu konumunuzdan görünür olacak. Maksimum yükseklik: ${pass.maxElevation || '--'}°`
        : `The International Space Station will be visible from your location. Max elevation: ${pass.maxElevation || '--'}°`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ISS Tracker Hub//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:iss-pass-${startDate.getTime()}@isstrackhub.app
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:🛰️ ${title}
DESCRIPTION:${description}
LOCATION:Sky above your location
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:${title} - ${lang === 'tr' ? '10 dakika sonra!' : '10 minutes!'}
TRIGGER:-PT10M
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
}

// Download ICS file
function downloadICS(pass) {
    const icsContent = generateICS(pass);
    if (!icsContent) {
        console.warn('[PassNotification] Cannot generate ICS: invalid pass data');
        return false;
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `iss-pass-${new Date(pass.startTime).toISOString().slice(0, 10)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
}

// Request browser notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.warn('[PassNotification] Browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

// Send browser notification
function sendNotification(title, body, tag = 'iss-pass') {
    if (Notification.permission !== 'granted') {
        console.warn('[PassNotification] Notification permission not granted');
        return;
    }

    const options = {
        body,
        icon: '/iss-tracker-hub/iss-icon.png', // You may need to create this
        badge: '/iss-tracker-hub/iss-badge.png',
        tag,
        requireInteraction: true,
        vibrate: [200, 100, 200]
    };

    const notification = new Notification(title, options);

    notification.onclick = () => {
        window.focus();
        notification.close();
    };

    return notification;
}

// Schedule notifications (30m & 10m)
function schedulePassNotification(pass) {
    if (!pass || !pass.startTime) return [];

    const startTime = new Date(pass.startTime).getTime();
    const now = Date.now();
    const timers = [];

    // Define alerts: 30 min and 10 min
    const alerts = [30, 10];

    alerts.forEach(minutes => {
        const notifyTime = startTime - (minutes * 60 * 1000);
        if (notifyTime > now) {
            const delay = notifyTime - now;

            const timerId = setTimeout(() => {
                const lang = getCurrentLanguage();
                const title = t('notify.title') || "ISS Tracker Hub";
                const bodyKey = minutes === 30 ? 'notify.body30m' : 'notify.body10m';
                const body = t(bodyKey) || `ISS pass in ${minutes} minutes.`;

                sendNotification(title, body);
            }, delay);

            timers.push(timerId);
            console.log(`[PassNotification] Scheduled ${minutes}m alert in ${Math.round(delay / 60000)}m`);
        }
    });

    return timers;
}

// Enable/disable pass notifications
async function togglePassNotifications(enabled) {
    if (enabled) {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.warn('[PassNotification] Permission denied');
            return { success: false, error: 'permission_denied' };
        }
    }

    await setPassNotifications(enabled);
    return { success: true };
}

// Check if notifications are enabled
function areNotificationsEnabled() {
    const prefs = getPreferences();
    return prefs?.notifications?.passAlerts === true;
}

// Export
export {
    generateICS,
    downloadICS,
    requestNotificationPermission,
    sendNotification,
    schedulePassNotification,
    togglePassNotifications,
    areNotificationsEnabled
};
