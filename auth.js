// auth.js
import { auth, signInWithEmailAndPassword, signOut } from "./firebase.js";

window.openAdminLogin = () => {
    document.getElementById("screen-home").classList.add("hidden");
    document.getElementById("screen-admin-login").classList.remove("hidden");
};

window.closeAdminLogin = () => {
    document.getElementById("screen-home").classList.remove("hidden");
    document.getElementById("screen-admin-login").classList.add("hidden");
};

window.adminLogin = (event) => {
    event.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById("screen-admin-login").classList.add("hidden");
            document.getElementById("screen-admin").classList.remove("hidden");
        })
        .catch(() => alert("Email ou senha inválidos."));
};

window.adminLogout = () => {
    signOut(auth).then(() => {
        document.getElementById("screen-admin").classList.add("hidden");
        document.getElementById("screen-home").classList.remove("hidden");
    });
};