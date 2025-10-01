// Firebase Configuration
const FIREBASE_CONFIG = {
    // Replace these with your actual Firebase credentials
    databaseURL: 'https://call-tracker-app-ba339-default-rtdb.firebaseio.com/',
    apiKey: 'AIzaSyCrSc7b5VX-ECpPVT7JDXI_yncdu7z-7g0'
};

// Login Credentials
const LOGIN_CREDENTIALS = {
    username: 'Admin',
    password: 'Admin@8129'
};

// API Endpoints
const API_ENDPOINTS = {
    callLogs: `${FIREBASE_CONFIG.databaseURL}/Call_Logs.json?auth=${FIREBASE_CONFIG.apiKey}`,
    location: `${FIREBASE_CONFIG.databaseURL}/Location.json?auth=${FIREBASE_CONFIG.apiKey}`
};