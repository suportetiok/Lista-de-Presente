// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getDatabase, ref, onValue, push, update, remove 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import {
    getAuth, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// 🔥 CONFIG SUA (mantém a original que você usava)
const firebaseConfig = {
    apiKey: "AIzaSyC7QQJ_c5wmd3GffLYDrQ3xG44LdXSApFg",
    authDomain: "lista-de-presentes-33c7f.firebaseapp.com",
    databaseURL: "https://lista-de-presentes-33c7f-default-rtdb.firebaseio.com",
    projectId: "lista-de-presentes-33c7f",
    storageBucket: "lista-de-presentes-33c7f.appspot.com",
    messagingSenderId: "540439045540",
    appId: "1:540439045540:web:23587a2640c46784ab0d31"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

export { ref, onValue, push, update, remove, signInWithEmailAndPassword, signOut };