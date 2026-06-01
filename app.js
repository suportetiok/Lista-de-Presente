// app.js - VERSÃO FINAL COM TODAS AS MELHORIAS SOLICITADAS
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
const btnListaCompras = document.getElementById('btn-lista-compras');
const btnLogs = document.getElementById('btn-logs');

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
const modalReservadoPor = document.getElementById('modal-reservado-por');
const modalMensagemRecado = document.getElementById('modal-mensagem-recado');

const reservaModal = document.getElementById('reserva-modal');
const reservaId = document.getElementById('reserva-id');
const reservaNomeItem = document.getElementById('reserva-nome-item');
const reservaNome = document.getElementById('reserva-nome');
const reservaMensagem = document.getElementById('reserva-mensagem');

const settingsModal = document.getElementById('settings-modal');
const cfgLoginTitle = document.getElementById('cfg-login-title');
const cfgLoginSubtitle = document.getElementById('cfg-login-subtitle');
const cfgMainTitle = document.getElementById('cfg-main-title');
const cfgWelcomeText = document.getElementById('cfg-welcome-text');
const cfgBgImage = document.getElementById('cfg-bg-image');
const cfgFooterText = document.getElementById('cfg-footer-text');


// ✅ FUNÇÕES GLOBAIS
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

window.handleAdminLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, senha);
        if(screenAdminLogin) screenAdminLogin.classList.add('hidden');
        if(screenDashboard) screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin();
        atualizarSaudacao();
        alert("✅ Logado com sucesso!");
    } catch (erro) {
        alert("❌ Erro no login: " + erro.message);
    }
};

window.loginComGoogle = async function() {
    try {
        const resultado = await signInWithPopup(auth, providerGoogle);
        usuarioAtualNome = resultado.user.displayName || "Administrador";
        if(screenAdminLogin) screenAdminLogin.classList.add('hidden');
        if(screenDashboard) screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin();
        atualizarSaudacao();
        alert("✅ Logado com Google com sucesso!");
    } catch (erro) {
        alert("❌ Erro ao logar com Google: " + erro.message);
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
        if(btnListaCompras) btnListaCompras.classList.add('hidden');
        if(btnLogs) btnLogs.classList.add('hidden');
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

window.openPixModal = function(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if (!gift) return;

    // SE ESTIVER RESERVADO, MOSTRA DADOS
    if(gift.reservadoPor) {
        if(modalReservadoPor) modalReservadoPor.textContent = gift.reservadoPor;
        if(modalMensagemRecado) modalMensagemRecado.textContent = gift.mensagem || "Sem mensagem.";
    } else {
        if(modalReservadoPor) modalReservadoPor.textContent = "Você ainda não reservou";
        if(modalMensagemRecado) modalMensagemRecado.textContent = "";
    }

    if(modalGiftName) modalGiftName.textContent = gift.name;
    if(modalGiftValue) modalGiftValue.textContent = gift.price;
    if(pixCopiaCola) pixCopiaCola.textContent = gift.pixKey;
    if(modalQrCode) modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gift.pixKey)}`;
    
    pixModal.classList.remove('hidden');
};

window.abrirReserva = function(giftId, nomeItem) {
    const gift = giftsData.find(g => g.id === giftId);
    if(gift && gift.reservadoPor) {
        alert("⚠️ Este presente já foi escolhido por outra pessoa!");
        return;
    }
    reservaId.value = giftId;
    reservaNomeItem.textContent = nomeItem;
    reservaModal.classList.remove('hidden');
};

window.confirmarReserva = async function(event) {
    event.preventDefault();
    const id = reservaId.value;
    const nomePessoa = reservaNome.value.trim();
    const mensagemPessoa = reservaMensagem.value.trim();

    try {
        const itemRef = ref(db, `gifts/${id}`);
        await update(itemRef, {
            reservadoPor: nomePessoa,
            mensagem: mensagemPessoa
        });

        // REGISTRA NO LOG
        registrarLog("RESERVA", `Item ${id} reservado por ${nomePessoa}`);

        alert("✅ Reserva confirmada! Agora é só pagar o PIX.");
        closeModal('reserva-modal');
        
        // Abre automaticamente o PIX após reservar
        openPixModal(id);

    } catch (erro) {
        alert("❌ Erro ao reservar: " + erro.message);
    }
};

window.abrirListaCompras = function() {
    if(!isAdmin) return;
    const conteudo = document.getElementById('lista-compras-conteudo');
    conteudo.innerHTML = '';

    const itensReservados = giftsData.filter(g => g.reservadoPor);
    
    if(itensReservados.length === 0) {
        conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhum item reservado ainda.</p>';
    } else {
        itensReservados.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-3 border border-gray-200 rounded-lg bg-white shadow-sm';
            div.innerHTML = `
                <p class="font-bold text-pink-700">${item.name} - ${item.price}</p>
                <p class="text-sm"><strong>Presenteado por:</strong> ${item.reservadoPor}</p>
                <p class="text-sm italic text-gray-600">Recado: ${item.mensagem || '---'}</p>
            `;
            conteudo.appendChild(div);
        });
    }
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = async function() {
    if(!isAdmin) return;
    const conteudo = document.getElementById('logs-conteudo');
    conteudo.innerHTML = '';

    const logsRef = ref(db, 'logs');
    const snapshot = await get(logsRef);
    
    if(!snapshot.exists()) {
        conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhuma alteração registrada.</p>';
    } else {
        let listaLogs = [];
        snapshot.forEach(child => {
            listaLogs.unshift({ id: child.key, ...child.val() }); // mais recente primeiro
        });

        listaLogs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'p-2 border-b border-gray-100';
            div.innerHTML = `
                <span class="text-gray-500 text-xs">[${log.data} ${log.hora}]</span> 
                <span class="font-semibold ${log.tipo === 'EXCLUSAO' ? 'text-red-600' : log.tipo === 'CRIACAO' ? 'text-green-600' : 'text-blue-600'}">${log.tipo}</span>
                <span class="text-gray-700">: ${log.descricao}</span>
            `;
            conteudo.appendChild(div);
        });
    }
    document.getElementById('logs-modal').classList.remove('hidden');
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
            registrarLog("EDIÇÃO", `Item ${editId.value} alterado: ${item.name}`);
            alert("✅ Item atualizado!");
        } else {
            const giftsRef = ref(db, 'gifts');
            const novoItemRef = await push(giftsRef, item);
            registrarLog("CRIACAO", `Novo item criado: ${item.name} (ID: ${novoItemRef.key})`);
            alert("✅ Novo item adicionado!");
        }
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.deleteItem = async function() {
    if(!isAdmin) { alert("❌ Apenas administradores podem excluir!"); return; }
    if(confirm("Tem certeza que deseja excluir? Essa ação não pode ser desfeita!")) {
        try {
            const nomeItemExcluido = giftsData.find(g => g.id === editId.value)?.name || editId.value;
            const itemRef = ref(db, `gifts/${editId.value}`);
            await remove(itemRef);
            registrarLog("EXCLUSAO", `Item excluído: ${nomeItemExcluido} (ID: ${editId.value})`);
            alert("✅ Item excluído!");
            closeModal('edit-modal');
        } catch (erro) {
            alert("❌ Erro: " + erro.message);
        }
    }
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
        registrarLog("CONFIG", `Configurações do sistema alteradas`);
        closeModal('settings-modal');
        alert("✅ Configurações salvas!");
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};


// ✅ VERIFICA SE ESTÁ LOGADO
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAdmin = true;
        usuarioAtualNome = user.displayName || "Administrador";
        mostrarBotoesAdmin();
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


// FUNÇÕES AUXILIARES
function atualizarSaudacao(){
    if(!welcomeText) return;
    const textoBase = siteConfig.welcomeText || "Olá, [NOME]! Escolha um item para presentear via PIX.";
    welcomeText.innerHTML = textoBase.replace("[NOME]", `<span class="font-semibold text-pink-600">${usuarioAtualNome}</span>`);
}

function mostrarBotoesAdmin(){
    if(btnNewItem) btnNewItem.classList.remove('hidden');
    if(btnSettings) btnSettings.classList.remove('hidden');
    if(btnListaCompras) btnListaCompras.classList.remove('hidden');
    if(btnLogs) btnLogs.classList.remove('hidden');
}

function registrarLog(tipo, descricao) {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR');
    
    push(ref(db, 'logs'), {
        tipo: tipo,
        descricao: descricao,
        data: data,
        hora: hora,
        usuario: usuarioAtualNome
    });
}

function renderGifts() {
    if(!giftsGrid) return;
    giftsGrid.innerHTML = '';
    
    if(giftsData.length === 0) {
        giftsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full bg-white/80 p-4 rounded-xl">Nenhum presente cadastrado ainda.</p>';
        return;
    }

    giftsData.forEach(gift => {
        const card = document.createElement('div');
        card.className = `card-item bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col justify-between hover:shadow-lg transition duration-200 relative ${gift.reservadoPor ? 'reservado' : ''}`;
        
        if(gift.imagem && gift.imagem !== "") {
            const imgTest = new Image();
            imgTest.onload = () => card.style.backgroundImage = `url("${gift.imagem}")`;
            imgTest.onerror = () => card.style.backgroundImage = "";
            imgTest.src = gift.imagem;
        }

        const adminEditButton = isAdmin ? `
            <button onclick="openEditModal('${gift.id}')" class="absolute top-2 right-2 z-10 text-gray-700 hover:text-pink-600 bg-white/80 p-1.5 rounded-full text-lg transition-transform hover:scale-110" title="Editar Item">✏️</button>
        ` : '';

        const botaoAcao = gift.reservadoPor 
            ? `<button onclick="openPixModal('${gift.id}')" class="w-full bg-gray-500/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg cursor-not-allowed">Ver Recado / PIX</button>`
            : `<button onclick="abrirReserva('${gift.id}', '${gift.name.replace(/'/g, "\\'")}')" class="w-full bg-pink-500/90 hover:bg-pink-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition duration-150">Escolher este</button>`;

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
                ${botaoAcao}
            </div>
        `;
        giftsGrid.appendChild(card);
    });
}
