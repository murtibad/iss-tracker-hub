// src/config/firebase.js
// Firebase SDK configuration for ISS Tracker Hub
// 
// Setup Instructions:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project: "iss-tracker-hub"
// 3. Add a Web App
// 4. Copy the config values to .env file
// 5. Enable Authentication (GitHub provider)
// 6. Create Firestore Database

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (only if config is complete)
let app = null;
let auth = null;
let db = null;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log('[Firebase] ✅ Initialized successfully');
    } else {
        console.warn('[Firebase] ⚠️  Not configured. Add values to .env file.');
    }
} catch (error) {
    console.error('[Firebase] ❌ Initialization failed:', error);
}

export { app, auth, db };
