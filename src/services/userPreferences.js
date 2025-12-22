// src/services/userPreferences.js
// Firestore service for storing user preferences

import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { getUser, onAuthChange } from './authService.js';

// Default preferences
const DEFAULT_PREFERENCES = {
    theme: 'dark',
    colorPalette: 'CYAN',
    language: 'tr',
    units: 'metric', // 'metric' or 'imperial'
    location: {
        lat: null,
        lon: null,
        name: null
    },
    notifications: {
        passAlerts: false,
        emailAlerts: false
    },
    savedImages: []
};

let cachedPreferences = null;
let unsubscribe = null;
const listeners = [];

// Initialize preferences listener when user logs in
onAuthChange((user) => {
    if (user) {
        subscribeToPreferences(user.uid);
    } else {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        cachedPreferences = null;
        notifyListeners(null);
    }
});

// Subscribe to real-time preference updates
function subscribeToPreferences(userId) {
    if (!db) {
        console.warn('[UserPrefs] Firestore not available');
        return;
    }

    const docRef = doc(db, 'users', userId, 'settings', 'preferences');

    unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            cachedPreferences = { ...DEFAULT_PREFERENCES, ...docSnap.data() };
        } else {
            // Create default preferences for new user
            cachedPreferences = { ...DEFAULT_PREFERENCES };
            savePreferences(cachedPreferences);
        }
        notifyListeners(cachedPreferences);
        console.log('[UserPrefs] Preferences loaded:', cachedPreferences);
    }, (error) => {
        console.error('[UserPrefs] Snapshot error:', error);
    });
}

// Get current preferences
function getPreferences() {
    return cachedPreferences || { ...DEFAULT_PREFERENCES };
}

// Save all preferences
async function savePreferences(prefs) {
    const user = getUser();
    if (!user || !db) {
        // Save to localStorage as fallback
        try {
            localStorage.setItem('isshub:preferences', JSON.stringify(prefs));
        } catch (e) { }
        return { success: true, local: true };
    }

    try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await setDoc(docRef, {
            ...prefs,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        cachedPreferences = prefs;
        return { success: true };
    } catch (error) {
        console.error('[UserPrefs] Save failed:', error);
        return { success: false, error: error.message };
    }
}

// Update a single preference
async function updatePreference(key, value) {
    const currentPrefs = getPreferences();
    const newPrefs = { ...currentPrefs, [key]: value };
    return savePreferences(newPrefs);
}

// Update nested preference (e.g., location.lat)
async function updateNestedPreference(path, value) {
    const user = getUser();
    if (!user || !db) {
        // Fallback to local
        const prefs = getPreferences();
        const keys = path.split('.');
        let obj = prefs;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return savePreferences(prefs);
    }

    try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        await updateDoc(docRef, {
            [path]: value,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('[UserPrefs] Update failed:', error);
        return { success: false, error: error.message };
    }
}

// Set user location
async function setUserLocation(lat, lon, name) {
    return updatePreference('location', { lat, lon, name });
}

// Set theme preference
async function setTheme(theme) {
    return updatePreference('theme', theme);
}

// Set color palette
async function setColorPalette(palette) {
    return updatePreference('colorPalette', palette);
}

// Set language
async function setLanguage(lang) {
    return updatePreference('language', lang);
}

// Enable/disable pass notifications
async function setPassNotifications(enabled) {
    return updateNestedPreference('notifications.passAlerts', enabled);
}

// Subscribe to preference changes
function onPreferencesChange(callback) {
    listeners.push(callback);
    // Immediately call with current state
    if (cachedPreferences) {
        callback(cachedPreferences);
    }

    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

function notifyListeners(prefs) {
    listeners.forEach(callback => {
        try {
            callback(prefs);
        } catch (e) {
            console.error('[UserPrefs] Listener error:', e);
        }
    });
}

// Load preferences from localStorage (for offline/unauthenticated users)
function loadLocalPreferences() {
    try {
        const saved = localStorage.getItem('isshub:preferences');
        if (saved) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        }
    } catch (e) { }
    return { ...DEFAULT_PREFERENCES };
}

// Export
export {
    getPreferences,
    savePreferences,
    updatePreference,
    setUserLocation,
    setTheme,
    setColorPalette,
    setLanguage,
    setPassNotifications,
    onPreferencesChange,
    loadLocalPreferences,
    DEFAULT_PREFERENCES
};
