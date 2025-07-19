// src/firebase.js
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCrS…",  
  authDomain: "questgen-usl3z.firebaseapp.com",
  projectId: "questgen-usl3z",
  storageBucket: "questgen-usl3z.appspot.com",
  messagingSenderId: "434640535644",
  appId: "1:434640535644:web:662d11094608c22f3e2699"
};

// Initialize and export
const app = initializeApp(firebaseConfig);
export default app;
