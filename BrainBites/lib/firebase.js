// lib/firebase.js
// Firebase Initialisierung (JS SDK) + Firestore Export

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// -> Hier kommt dein firebaseConfig aus Firebase Console (Web-App)
const firebaseConfig = {
    apiKey: "AIzaSyCHD48SDNLp-E8GYaR2TMihUQRw6t2BI_Q",
    authDomain: "fir-brainbites.firebaseapp.com",
    projectId: "fir-brainbites",
    storageBucket: "fir-brainbites.firebasestorage.app",
    messagingSenderId: "310901494686",
    appId: "1:310901494686:web:80b8028c40841ec0a43c8f",
};

// App initialisieren
const app = initializeApp(firebaseConfig);

// Firestore DB exportieren
export const db = getFirestore(app);
