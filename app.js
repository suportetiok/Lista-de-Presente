// app.js
import { db, ref, onValue, set, update, push, remove } from './firebase.js';

// Variáveis Globais
let ADMIN_PASSWORD = "admin123";
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";

// Elementos
const screenLogin = document.getElementById('screen-login');
const screenAdminLogin = document.getElementById('screen-admin-login');
const screenDashboard = document.getElementById('screen-dashboard');
const giftsGrid = document.getElementById('gifts-grid');
const welcomeText = document.getElementById('welcome-text');
const footerText = document.getElementById('footer-text');
const paginaPrincipal = document.getElementById('pagina-principal');
const btnNewItem = document.getElementById('btn-new-item');
const btnSettings = document.getElementById('btn-settings');
const editModal = document.getElementById('edit-modal');
const editId = document.getElementById('edit-id');
const editName = document.getElementById('edit-name');
const editPrice = document.getElementById('edit-price');
const editIcon = document.getElementById('edit-icon');
const editImagem = document.getElementById('edit-imagem');
const editPixKey = document.getElementById('edit-pixkey');
const btnDelete = document.getElementById('btn-delete');
const pixModal = document.getElementById('pix-modal');
const modalGiftName = document.getElementById('modal-gift-name');
const modalGiftValue = document.getElementById('modal-gift-value');
const modalQrCode = document.getElementById('modal-qr-code');
const pixCopiaCola = document.getElementById('pix-copia-cola');


document.addEventListener("DOMContentLoaded", () => {
    const giftsRef = ref(db, 'gifts');
    const configRef = ref(db, 'configuracoes');

    onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
            siteConfig = snapshot.val();
            ADMIN_PASSWORD = siteConfig.adminPassword || "admin123";
            
            document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
            document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se para acessar a lista";
            document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
            footerText.textContent = siteConfig.footerText || "© 2026 Lista de Presentes";

            if(siteConfig.backgroundImage && siteConfig.backgroundImage !== "") {
                paginaPrincipal.style.backgroundImage = `url("${siteConfig.backgroundImage}")`;
            }

            if(usuarioAtualNome !== "") atualizarSaudacao();

        } else {
            set(configRef, {
                loginTitle: "Lista de Presentes",
                loginSubtitle: "Identifique-se para acessar a lista",
                mainTitle: "Presentes",
                welcomeText: "Olá, [NOME]! Escolha um item para presentear via PIX.",
                footerText: "Lista de Presentes Fictícia &copy; 2026",
                backgroundImage: "",
                adminPassword: "admin123"
            });
        }
    });

    onValue(giftsRef, (snapshot) => {
        giftsData = [];
        snapshot.forEach((childSnapshot) => {
            giftsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        renderGifts();
    });
});


function atualizarSaudacao(){
    const textoBase = siteConfig.welcomeText || "Olá, [NOME]! Escolha um item para presentear via PIX.";
    welcomeText.innerHTML = textoBase.replace("[NOME]", `<span class="font-semibold text-pink-600">${usuarioAtualNome}</span>`);
}


// ---------------- FUNÇÕES DE TROCAR TELA (AGORA FUNCIONAM) ----------------
function showAdminLogin() {
    screenLogin.classList.add('hidden');
    screenAdminLogin.classList.remove('hidden');
}
window.showAdminLogin = showAdminLogin;

function hideAdminLogin() {
    screenAdminLogin.classList.add('hidden');
    screenLogin.classList.remove('hidden');
}
window.hideAdminLogin = hideAdminLogin;


function handleAdminLogin(event) {
    event.preventDefault();
    const pass = document.getElementById('admin-password').value;
    if(pass === ADMIN_PASSWORD) {
        isAdmin = true;
        usuarioAtualNome = "Administrador";
        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        btnNewItem.classList.remove('hidden');
        btnSettings.classList.remove('hidden');
        atualizarSaudacao();
        renderGifts();
    } else {
        alert("Senha incorreta!");
    }
    document.getElementById('admin-password').value = "";
}
window.handleAdminLogin = handleAdminLogin;


function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    isAdmin = false;
    
    if (username) {
        usuarioAtualNome = username;
        atualizarSaudacao();
        screenLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        btnNewItem.classList.add('hidden');
        btnSettings.classList.add('hidden');
    }
}
window.handleLogin = handleLogin;


function handleLogout() {
    document.getElementById('username').value = '';
    screenDashboard.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    isAdmin = false;
    usuarioAtualNome = "";
}
window.handleLogout = handleLogout;


function renderGifts() {
    giftsGrid.innerHTML = '';
    if(giftsData.length === 0) {
        giftsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full bg-white/80 p-4 rounded-xl">Nenhum presente cadastrado ainda.</p>';
        return;
    }

    giftsData.forEach(gift => {
        const card = document.createElement('div');
        card.className = "card-item bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition duration-200 relative";
        
        if(gift.imagem && gift.imagem !== "") card.style.backgroundImage = `url("${gift.imagem}")`;

        const adminEditButton = isAdmin ? `
            <button onclick="openEditModal('${gift.id}')" class="absolute top-2 right-2 z-10 text-gray-700 hover:text-pink-600 bg-white/80 p-1.5 rounded-full text-lg transition-transform hover:scale-110" title="Editar Item">✏️</button>
        ` : '';

        card.innerHTML = `
            <div class="card-overlay"></div>
            ${adminEditButton} 
            <div class="card-content">
                <div class="text-4xl mb-4 bg-pink-50/80 inline-block p-3 rounded-xl flex items-center justify-center">
                    <img src="${gift.icon}" alt="Ícone" class="icon-img">
                </div>
                <h2 class="text-lg font-bold text-gray-800 mb-1">${gift.name}</h2>
                <p class="text-gray-600 text-sm mb-4">Valor estimado</p>
                <p class="text-xl font-extrabold text-pink-600 mb-4">${gift.price}</p>
                <button onclick="openPixModal('${gift.id}')" class="w-full bg-gray-800/90 hover:bg-gray-900 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition duration-150">Presentear via PIX</button>
            </div>
        `;
        giftsGrid.appendChild(card);
    });
}


function openPixModal(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if (gift) {
        modalGiftName.textContent = gift.name;
        modalGiftValue.textContent = gift.price;
        pixCopiaCola.textContent = gift.pixKey;
        modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gift.pixKey)}`;
        pixModal.classList.remove('hidden');
    }
}
window.openPixModal = openPixModal;


function openNewItemModal() {
    document.getElementById('edit-modal-title').textContent = "Adicionar Novo Presente";
    editId.value = "";
    editName.value = "";
    editPrice.value = "";
    editIcon.value = "";
    editImagem.value = "";
    editPixKey.value = "";
    btnDelete.classList.add('hidden');
    editModal.classList.remove('hidden');
}
window.openNewItemModal = openNewItemModal;


function openEditModal(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if(gift) {
        document.getElementById('edit-modal-title').textContent = "Editar Presente";
        editId.value = gift.id;
        editName.value = gift.name;
        editPrice.value = gift.price;
        editIcon.value = gift.icon;
        editImagem.value = gift.imagem || "";
        editPixKey.value = gift.pixKey;
        btnDelete.classList.remove('hidden');
        editModal.classList.remove('hidden');
    }
}
window.openEditModal = openEditModal;


function saveItem(event) {
    event.preventDefault();
    const item = {
        name: editName.value,
        price: editPrice.value,
        icon: editIcon.value,
        imagem: editImagem.value,
        pixKey: editPixKey.value
    };

    if(editId.value) {
        update(ref(db, `gifts/${editId.value}`), item);
    } else {
        push(ref(db, 'gifts'), item);
    }
    closeModal('edit-modal');
}
window.saveItem = saveItem;


function deleteItem() {
    if(confirm("Tem certeza que deseja excluir?")) {
        remove(ref(db, `gifts/${editId.value}`));
        closeModal('edit-modal');
    }
}
window.deleteItem = deleteItem;


function openSettingsModal() {
    document.getElementById('cfg-login-title').value = siteConfig.loginTitle || "";
    document.getElementById('cfg-login-subtitle').value = siteConfig.loginSubtitle || "";
    document.getElementById('cfg-main-title').value = siteConfig.mainTitle || "";
    document.getElementById('cfg-welcome-text').value = siteConfig.welcomeText || "";
    document.getElementById('cfg-bg-image').value = siteConfig.backgroundImage || "";
    document.getElementById('cfg-footer-text').value = siteConfig.footerText || "";
    document.getElementById('cfg-admin-pass').value = "";
    document.getElementById('settings-modal').classList.remove('hidden');
}
window.openSettingsModal = openSettingsModal;


function saveSettings(event) {
    event.preventDefault();
    const novaSenha = document.getElementById('cfg-admin-pass').value;
    const configRef = ref(db, 'configuracoes');
    
    const dados = {
        loginTitle: document.getElementById('cfg-login-title').value,
        loginSubtitle: document.getElementById('cfg-login-subtitle').value,
        mainTitle: document.getElementById('cfg-main-title').value,
        welcomeText: document.getElementById('cfg-welcome-text').value,
        backgroundImage: document.getElementById('cfg-bg-image').value,
        footerText: document.getElementById('cfg-footer-text').value,
        adminPassword: novaSenha ? novaSenha : ADMIN_PASSWORD
    };

    update(configRef, dados);
    ADMIN_PASSWORD = dados.adminPassword;
    closeModal('settings-modal');
    alert('Configurações salvas com sucesso!');
}
window.saveSettings = saveSettings;


function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}
window.closeModal = closeModal;


function copyPixKey() {
    navigator.clipboard.writeText(pixCopiaCola.textContent).then(() => alert("Copiado!"));
}
window.copyPixKey = copyPixKey;
