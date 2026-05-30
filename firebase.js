// firebase.js - Configuração segura
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, push, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

// 🔒 Suas chaves do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC7QQJ_c5wmd3GffLYDrQ3xG44LdXSApFg",
    authDomain: "lista-de-presentes-33c7f.firebaseapp.com",
    databaseURL: "https://lista-de-presentes-33c7f-default-rtdb.firebaseio.com",
    projectId: "lista-de-presentes-33c7f",
    storageBucket: "lista-de-presentes-33c7f.firebasestorage.app",
    messagingSenderId: "540439045540",
    appId: "1:540439045540:web:23587a2640c46784ab0d31"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, update, push, remove };
