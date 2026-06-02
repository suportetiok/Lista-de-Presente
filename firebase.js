import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const firebaseConfig = {
  // ⚠️ COLE AQUI SUAS CONFIGURAÇÕES DO FIREBASE (apiKey, authDomain, etc...)
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "SEU_DOMINIO_AQUI",
  databaseURL: "SUA_URL_DO_BANCO_AQUI",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const providerGoogle = new GoogleAuthProvider();

export { 
  db, 
  auth, 
  providerGoogle, 
  getDatabase,
  getAuth,
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  ref, 
  onValue, 
  set, 
  update, 
  push, 
  remove, 
  get 
};

// Importações adicionais necessárias
import { ref, onValue, set, update, push, remove, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
