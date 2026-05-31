// app.js - VERSÃO COM GOOGLE FUNCIONANDO 100%
import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

// Variáveis Globais
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";

// Elementos da página
const screenLogin = document.getElementById('screen-login');
const screenAdminLogin = document.getElementById('screen-admin-login');
const screenDashboard = document.getElementById('screen-dashboard');
const giftsGrid = document.getElementById('gifts-grid');
const welcomeText = document.getElementById('welcomeText');
const footerText = document.getElementById('footer-text');
const paginaPrincipal = document.getElementById('pagina-principal');
const btnNewItem = document.getElementById('btn-new-item');
const btnSettings = document.getElementById('btn-settings');

// Elementos Modais
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

const settingsModal = document.getElementById('settings-modal');
const cfgLoginTitle = document.getElementById('cfg-login-title');
const cfgLoginSubtitle = document.getElementById('cfg-login-subtitle');
const cfgMainTitle = document.getElementById('cfg-main-title');
const cfgWelcomeText = document.getElementById('cfg-welcome-text');
const cfgBgImage = document.getElementById('cfg-bg-image');
const cfgFooterText = document.getElementById('cfg-footer-text');


// ✅ FUNÇÕES GLOBAIS (AGORA TODAS ESTÃO SENDO EXPORTADAS PARA O HTML ENXERGAR)
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('hidden');
};

window.copyPixKey = function() {
    if (!pixCopiaCola) return;
    navigator.clipboard.writeText(pixCopiaCola.textContent)
        .then(() => alert("✅ Código PIX copiado!"))
        .catch(() => alert("❌ Erro ao copiar, copie manualmente."));
};

window.showAdminLogin = function() {
    if(screenLogin) screenLogin.classList.add('hidden');
    if(screenAdminLogin) screenAdminLogin.classList.remove('hidden');
};

window.hideAdminLogin = function() {
    if(screenAdminLogin) screenAdminLogin.classList.add('hidden');
    if(screenLogin) screenLogin.classList.remove('hidden');
};

// ✅ LOGIN EMAIL/SENHA (CONTINUA O MESMO)
window.handleAdminLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        if(screenAdminLogin) screenAdminLogin.classList.add('hidden');
        if(screenDashboard) screenDashboard.classList.remove('hidden');
        if(btnNewItem) btnNewItem.classList.remove('hidden');
        if(btnSettings) btnSettings.classList.remove('hidden');
        atualizarSaudacao();
        alert("✅ Logado com sucesso!");
    } catch (erro) {
        alert("❌ Erro no login: " + erro.message);
    }
};

// ✅ LOGIN COM GOOGLE (CORRIGIDO E GLOBAL)
window.loginComGoogle = async function() {
    try {
        // Abre a janela de login do Google
        const resultado = await signInWithPopup(auth, providerGoogle);
        
        // Se deu certo, entra na área administrativa
        usuarioAtualNome = resultado.user.displayName || "Administrador";
        if(screenAdminLogin) screenAdminLogin.classList.add('hidden');
        if(screenDashboard) screenDashboard.classList.remove('hidden');
        if(btnNewItem) btnNewItem.classList.remove('hidden');
        if(btnSettings) btnSettings.classList.remove('hidden');
        atualizarSaudacao();
        
        // 📋 IMPORTANTE: Ao logar, olhe o console (F12) e pegue o ID que aparecer aqui!
        console.log("=== SEU ID DO GOOGLE É ESTE ===");
        console.log(resultado.user.uid);
        console.log("Copie o código acima e coloque nas regras do Firebase!");
        
        alert("✅ Logado com Google com sucesso!");
    } catch (erro) {
        alert("❌ Erro ao logar com Google: " + erro.message);
        console.error(erro);
    }
};


window.handleLogin = function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    isAdmin = false;
    
    if (username) {
        usuarioAtualNome = username;
        atualizarSaudacao();
        if(screenLogin) screenLogin.classList.add('hidden');
        if(screenDashboard) screenDashboard.classList.remove('hidden');
        if(btnNewItem) btnNewItem.classList.add('hidden');
        if(btnSettings) btnSettings.classList.add('hidden');
    }
};


window.handleLogout = async function() {
    try {
        await signOut(auth);
    } catch (e) {}
    if(screenDashboard) screenDashboard.classList.add('hidden');
    if(screenLogin) screenLogin.classList.remove('hidden');
    isAdmin = false;
    usuarioAtualNome = "";
    document.getElementById('username').value = '';
};

window.openNewItemModal = function() {
    if(!editModal || !isAdmin) return;
    document.getElementById('edit-modal-title').textContent = "Adicionar Novo Presente";
    editId.value = "";
    editName.value = "";
    editPrice.value = "";
    editIcon.value = "";
    editImagem.value = "";
    editPixKey.value = "";
    if(btnDelete) btnDelete.classList.add('hidden');
    editModal.classList.remove('hidden');
};

window.openEditModal = function(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if(gift && editModal && isAdmin) {
        document.getElementById('edit-modal-title').textContent = "Editar Presente";
        editId.value = gift.id;
        editName.value = gift.name;
        editPrice.value = gift.price;
        editIcon.value = gift.icon;
        editImagem.value = gift.imagem || "";
        editPixKey.value = gift.pixKey;
        if(btnDelete) btnDelete.classList.remove('hidden');
        editModal.classList.remove('hidden');
    }
};

window.saveItem = async function(event) {
    event.preventDefault();
    if(!isAdmin) { alert("❌ Apenas administradores podem alterar!"); return; }

    const item = {
        name: editName.value.trim(),
        price: editPrice.value.trim(),
        icon: editIcon.value.trim(),
        imagem: editImagem.value.trim() || "",
        pixKey: editPixKey.value.trim()
    };

    try {
        if(editId.value) {
            const itemRef = ref(db, `gifts/${editId.value}`);
            await update(itemRef, item);
            alert("✅ Item atualizado!");
        } else {
            const giftsRef = ref(db, 'gifts');
            await push(giftsRef, item);
            alert("✅ Novo item adicionado!");
        }
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.deleteItem = async function() {
    if(!isAdmin) { alert("❌ Apenas administradores podem excluir!"); return; }
    if(confirm("Tem certeza?")) {
        try {
            const itemRef = ref(db, `gifts/${editId.value}`);
            await remove(itemRef);
            alert("✅ Item excluído!");
            closeModal('edit-modal');
        } catch (erro) {
            alert("❌ Erro: " + erro.message);
        }
    }
};

window.openSettingsModal = function() {
    if(!settingsModal || !isAdmin) return;
    cfgLoginTitle.value = siteConfig.loginTitle || "";
    cfgLoginSubtitle.value = siteConfig.loginSubtitle || "";
    cfgMainTitle.value = siteConfig.mainTitle || "";
    cfgWelcomeText.value = siteConfig.welcomeText || "";
    cfgBgImage.value = siteConfig.backgroundImage || "";
    cfgFooterText.value = siteConfig.footerText || "";
    settingsModal.classList.remove('hidden');
};

window.saveSettings = async function(event) {
    event.preventDefault();
    if(!isAdmin) { alert("❌ Apenas administradores podem alterar!"); return; }
    try {
        const configRef = ref(db, 'configuracoes');
        const dadosAtualizados = {
            loginTitle: cfgLoginTitle.value,
            loginSubtitle: cfgLoginSubtitle.value,
            mainTitle: cfgMainTitle.value,
            welcomeText: cfgWelcomeText.value,
            backgroundImage: cfgBgImage.value,
            footerText: cfgFooterText.value
        };
        await update(configRef, dadosAtualizados);
        closeModal('settings-modal');
        alert("✅ Configurações salvas!");
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.openPixModal = function(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if (gift && pixModal) {
        if(modalGiftName) modalGiftName.textContent = gift.name;
        if(modalGiftValue) modalGiftValue.textContent = gift.price;
        if(pixCopiaCola) pixCopiaCola.textContent = gift.pixKey;
        if(modalQrCode) modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gift.pixKey)}`;
        pixModal.classList.remove('hidden');
    }
};


// ✅ VERIFICA SE ESTÁ LOGADO
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAdmin = true;
        usuarioAtualNome = user.displayName || "Administrador";
    } else {
        isAdmin = false;
    }
    renderGifts();
});


document.addEventListener("DOMContentLoaded", () => {
    const giftsRef = ref(db, 'gifts');
    const configRef = ref(db, 'configuracoes');

    onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
            siteConfig = snapshot.val();
            
            if(document.getElementById('login-title')) document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
            if(document.getElementById('login-subtitle')) document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se para acessar";
            if(document.getElementById('main-title')) document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
            if(footerText) footerText.textContent = siteConfig.footerText || "© 2026 Lista de Presentes";

            if(siteConfig.backgroundImage && siteConfig.backgroundImage !== "" && paginaPrincipal) {
                paginaPrincipal.style.backgroundImage = `url("${siteConfig.backgroundImage}")`;
            }

            if(usuarioAtualNome !== "") atualizarSaudacao();

        } else {
            set(configRef, {
                loginTitle: "Lista de Presentes",
                loginSubtitle: "Identifique-se para acessar a lista",
                mainTitle: "Presentes",
                welcomeText: "Olá, [NOME]! Escolha um item para presentear via PIX.",
                footerText: "Lista de Presentes &copy; 2026",
                backgroundImage: ""
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
    if(!welcomeText) return;
    const textoBase = siteConfig.welcomeText || "Olá, [NOME]! Escolha um item para presentear via PIX.";
    welcomeText.innerHTML = textoBase.replace("[NOME]", `<span class="font-semibold text-pink-600">${usuarioAtualNome}</span>`);
}


// ---------------- RENDERIZAR ITENS ----------------
function renderGifts() {
    if(!giftsGrid) return;
    giftsGrid.innerHTML = '';
    
    if(giftsData.length === 0) {
        giftsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full bg-white/80 p-4 rounded-xl">Nenhum presente cadastrado ainda.</p>';
        return;
    }

    giftsData.forEach(gift => {
        const card = document.createElement('div');
        card.className = "card-item bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition duration-200 relative";
        
        if(gift.imagem && gift.imagem !== "") {
            const imgTest = new Image();
            imgTest.onload = () => card.style.backgroundImage = `url("${gift.imagem}")`;
            imgTest.onerror = () => card.style.backgroundImage = "";
            imgTest.src = gift.imagem;
        }

        const adminEditButton = isAdmin ? `
            <button onclick="openEditModal('${gift.id}')" class="absolute top-2 right-2 z-10 text-gray-700 hover:text-pink-600 bg-white/80 p-1.5 rounded-full text-lg transition-transform hover:scale-110" title="Editar Item">✏️</button>
        ` : '';

        card.innerHTML = `
            <div class="card-overlay"></div>
            ${adminEditButton} 
            <div class="card-content">
                <div class="text-4xl mb-4 bg-pink-50/80 inline-block p-3 rounded-xl flex items-center justify-center">
                    <img src="${gift.icon}" alt="Ícone" class="icon-img" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3099/3099358.png'">
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
