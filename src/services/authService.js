// src/services/authService.js
// Firebase Authentication Service

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { t } from '../i18n/i18n.js';

// Auth state listeners
const listeners = [];

// Current user state
let currentUser = null;

// Error messages in Turkish/English
const ERROR_MESSAGES = {
    'auth/email-already-in-use': {
        tr: 'Bu e-posta zaten kullanımda',
        en: 'This email is already in use'
    },
    'auth/invalid-email': {
        tr: 'Geçersiz e-posta adresi',
        en: 'Invalid email address'
    },
    'auth/weak-password': {
        tr: 'Şifre en az 6 karakter olmalı',
        en: 'Password should be at least 6 characters'
    },
    'auth/user-not-found': {
        tr: 'Bu e-posta ile kayıtlı kullanıcı yok',
        en: 'No user found with this email'
    },
    'auth/wrong-password': {
        tr: 'Şifre hatalı',
        en: 'Wrong password'
    },
    'auth/too-many-requests': {
        tr: 'Çok fazla deneme. Lütfen bekleyin.',
        en: 'Too many attempts. Please wait.'
    },
    'auth/network-request-failed': {
        tr: 'İnternet bağlantısı yok',
        en: 'No internet connection'
    },
    'default': {
        tr: 'Bir hata oluştu',
        en: 'An error occurred'
    }
};

function getErrorMessage(code, lang = 'tr') {
    const msg = ERROR_MESSAGES[code] || ERROR_MESSAGES['default'];
    return msg[lang] || msg['en'];
}

// Initialize auth listener
function initAuth() {
    if (!auth) {
        console.warn('[AuthService] Firebase auth not initialized');
        return;
    }

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        notifyListeners(user);

        if (user) {
            console.log('[AuthService] User signed in:', user.email);
        } else {
            console.log('[AuthService] User signed out');
        }
    });
}

// Sign up with email/password
async function signUp(email, password, displayName = null) {
    if (!auth) throw new Error('Firebase not initialized');

    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName && result.user) {
            await updateProfile(result.user, { displayName });
        }

        return { success: true, user: result.user };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error.code),
            code: error.code
        };
    }
}

// Sign in with email/password
async function signIn(email, password) {
    if (!auth) throw new Error('Firebase not initialized');

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error.code),
            code: error.code
        };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    if (!auth) throw new Error('Firebase not initialized');

    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return { success: true, user: result.user };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error.code),
            code: error.code
        };
    }
}

// Sign out
async function logout() {
    if (!auth) return { success: true };

    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Password reset
async function resetPassword(email) {
    if (!auth) throw new Error('Firebase not initialized');

    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error.code),
            code: error.code
        };
    }
}

// Get current user
function getUser() {
    return currentUser;
}

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Subscribe to auth changes
function onAuthChange(callback) {
    listeners.push(callback);
    // Immediately call with current state
    callback(currentUser);

    // Return unsubscribe function
    return () => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
    };
}

function notifyListeners(user) {
    listeners.forEach(callback => {
        try {
            callback(user);
        } catch (e) {
            console.error('[AuthService] Listener error:', e);
        }
    });
}

// Initialize on load
initAuth();

export {
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    getUser,
    isLoggedIn,
    onAuthChange
};
