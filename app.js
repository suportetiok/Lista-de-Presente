// app.js
import { db, ref, onValue, push, update, remove } from "./firebase.js";

// ------------------------------
// Renderização dos Presentes
// ------------------------------
const giftsGrid = document.getElementById("gifts-grid");
const adminGrid = document.getElementById("admin-gifts-grid");

onValue(ref(db, "gifts"), (snapshot) => {
    const items = [];
    snapshot.forEach(s => items.push({ id: s.key, ...s.val() }));

    renderUserGifts(items);
    renderAdminGifts(items);
});

function renderUserGifts(list) {
    if (!list.length) {
        giftsGrid.innerHTML = `<p class="col-span-full text-gray-500">Nenhum presente.</p>`;
        return;
    }

    giftsGrid.innerHTML = list.map(item => `
        <div class="gift-card bg-white p-4 rounded-xl shadow">
            <img src="${item.icon}" class="w-14 h-14 mb-2" />

            <h3 class="font-bold text-lg">${item.name}</h3>
            <p class="text-gray-600">Valor: ${item.price}</p>

            <button onclick="openPix('${item.id}')"
                class="mt-3 w-full bg-gray-800 text-white py-2 rounded-lg">
                Presentear via PIX
            </button>
        </div>
    `).join("");
}


// ------------------------------
// ADMIN – LISTA
// ------------------------------
function renderAdminGifts(list) {
    adminGrid.innerHTML = list.map(item => `
        <div class="bg-white p-4 rounded-xl shadow">
            <h3 class="font-bold">${item.name}</h3>
            <p class="text-gray-600">${item.price}</p>

            <button onclick="editGift('${item.id}')"
                class="mt-3 bg-purple-600 text-white py-1 px-3 rounded-lg text-sm">
                Editar
            </button>
        </div>
    `).join("");
}


// ------------------------------
// MODAL NOVO ITEM / EDITAR
// ------------------------------
window.openNewGiftModal = () => {
    document.getElementById("gift-id").value = "";
    document.getElementById("gift-name").value = "";
    document.getElementById("gift-price").value = "";
    document.getElementById("gift-icon").value = "";
    document.getElementById("gift-image").value = "";
    document.getElementById("gift-pix").value = "";
    
    document.getElementById("gift-delete").classList.add("hidden");
    document.getElementById("gift-modal-title").textContent = "Novo Item";

    document.getElementById("gift-modal").classList.remove("hidden");
};

window.editGift = (id) => {
    onValue(ref(db, "gifts/" + id), (snap) => {
        const item = snap.val();

        document.getElementById("gift-id").value = id;
        document.getElementById("gift-name").value = item.name;
        document.getElementById("gift-price").value = item.price;
        document.getElementById("gift-icon").value = item.icon;
        document.getElementById("gift-image").value = item.image || "";
        document.getElementById("gift-pix").value = item.pixKey;

        document.getElementById("gift-delete").classList.remove("hidden");
        document.getElementById("gift-modal-title").textContent = "Editar Item";

        document.getElementById("gift-modal").classList.remove("hidden");
    }, { onlyOnce: true });
};


window.closeGiftModal = () => {
    document.getElementById("gift-modal").classList.add("hidden");
};


// ------------------------------
// SALVAR ITEM (novo ou edição)
// ------------------------------
window.saveGift = (event) => {
    event.preventDefault();

    const id = document.getElementById("gift-id").value;

    const data = {
        name: document.getElementById("gift-name").value,
        price: document.getElementById("gift-price").value,
        icon: document.getElementById("gift-icon").value,
        image: document.getElementById("gift-image").value,
        pixKey: document.getElementById("gift-pix").value,
    };

    if (id) {
        update(ref(db, "gifts/" + id), data);
    } else {
        push(ref(db, "gifts"), data);
    }

    closeGiftModal();
};


// ------------------------------
// EXCLUIR ITEM
// ------------------------------
window.deleteGift = () => {
    const id = document.getElementById("gift-id").value;
    if (!id) return;

    if (confirm("Excluir este presente?")) {
        remove(ref(db, "gifts/" + id));
        closeGiftModal();
    }
};