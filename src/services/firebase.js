// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAVVpsQ9EztwDp6MFDrStiDIYPUA1h8HBE",
    authDomain: "recipeapp-cf0ab.firebaseapp.com",
    databaseURL: "https://recipeapp-cf0ab-default-rtdb.firebaseio.com",
    projectId: "recipeapp-cf0ab",
    storageBucket: "recipeapp-cf0ab.firebasestorage.app",
    messagingSenderId: "126299125693",
    appId: "1:126299125693:web:4b0a43d7bc6a372fd004d4",
    measurementId: "G-2RW1663FDM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;