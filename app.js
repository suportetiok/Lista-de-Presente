import { db, ref, onValue, get, update } from "./firebase.js";

let currentUser = "";
let currentGift = null;
const adminPassword = "admin123";

function showScreen(id) {
    document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

window.enterList = () => {
    const name = document.getElementById("user-name").value.trim();
    if (name.length < 3) return alert("Digite seu nome completo.");
    
    currentUser = name;

    document.getElementById("user-display").innerText = "Bem-vindo, " + name;
    showScreen("screen-list");

    loadGifts();
};

window.openAdminLogin = () => showScreen("screen-admin-login");
window.backToStart = () => showScreen("screen-start");

window.adminLogin = () => {
    const pass = document.getElementById("admin-password").value;
    if (pass !== adminPassword) return alert("Senha incorreta!");

    document.getElementById("user-display").innerText = "Administrador";
    showScreen("screen-list");
    loadGifts();
};

function loadGifts() {
    const giftsGrid = document.getElementById("gifts-grid");

    onValue(ref(db, "gifts"), (snap) => {
        const list = [];
        snap.forEach(item => list.push({ id: item.key, ...item.val() }));

        giftsGrid.innerHTML = list
            .map(item => `
                <div class="bg-white p-4 rounded-xl shadow">
                    <h3 class="font-bold">${item.name}</h3>
                    <p class="text-gray-600 mb-3">${item.price}</p>
                    <button onclick="openPix('${item.id}')"
                            class="w-full bg-purple-600 text-white py-2 rounded-lg">
                        Presentear
                    </button>
                </div>
            `)
            .join("");
    });
}

window.openPix = async (id) => {
    currentGift = id;

    const snap = await get(ref(db, "gifts/" + id));
    const item = snap.val();

    const key = item.pixKey;
    document.getElementById("pix-key").innerText = key;

    // Gerar QR Code
    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), key);

    document.getElementById("pix-modal").classList.remove("hidden");
};

window.closePix = () => {
    document.getElementById("pix-modal").classList.add("hidden");
};

window.copyPixKey = () => {
    navigator.clipboard.writeText(document.getElementById("pix-key").innerText);
    alert("Chave copiada!");
};

window.confirmPix = () => {
    if (!currentGift) return;

    update(ref(db, "gifts/" + currentGift), { status: "pago" });

    alert("Obrigado! Presente confirmado.");
    closePix();
};
