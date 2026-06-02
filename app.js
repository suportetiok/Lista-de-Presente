import { db, auth, providerGoogle, ref, onValue, set, update, push, remove, get, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';

// Variáveis Globais
let isAdmin = false;
let giftsData = [];
let siteConfig = {};
let usuarioAtualNome = "";
let itemAtualId = "";

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
const botoesAcaoPix = document.getElementById('botoes-acao-pix');

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


// ==============================================
// FUNÇÕES GLOBAIS (Todas funcionais)
// ==============================================

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
    screenLogin.classList.add('hidden');
    screenAdminLogin.classList.remove('hidden');
};

window.hideAdminLogin = function() {
    screenAdminLogin.classList.add('hidden');
    screenLogin.classList.remove('hidden');
};

// ✅ LOGIN ADMIN CORRIGIDO
window.handleAdminLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const senha = document.getElementById('admin-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        isAdmin = true; 
        usuarioAtualNome = userCredential.user.email || "Administrador";
        
        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin();
        atualizarSaudacao();
        renderGifts();
        alert("✅ Logado como Administrador!");
    } catch (erro) {
        console.error("ERRO LOGIN:", erro);
        alert("❌ Verifique e-mail, senha ou regras do banco.");
    }
};

window.loginComGoogle = async function() {
    try {
        const resultado = await signInWithPopup(auth, providerGoogle);
        isAdmin = true;
        usuarioAtualNome = resultado.user.displayName || resultado.user.email || "Administrador";
        
        screenAdminLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        mostrarBotoesAdmin();
        atualizarSaudacao();
        renderGifts();
        alert("✅ Logado com Google!");
    } catch (erro) {
        alert("❌ Erro ao logar com Google.");
    }
};

// ✅ LOGIN USUÁRIO COMUM
window.handleLogin = function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    isAdmin = false;
    
    if (username) {
        usuarioAtualNome = username;
        atualizarSaudacao();
        screenLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        // Esconde botões de admin
        btnNewItem.classList.add('hidden');
        btnSettings.classList.add('hidden');
        btnListaCompras.classList.add('hidden');
        btnLogs.classList.add('hidden');
        renderGifts();
    }
};

window.handleLogout = async function() {
    try {
        await signOut(auth);
    } catch (e) {}
    screenDashboard.classList.add('hidden');
    screenLogin.classList.remove('hidden');
    isAdmin = false;
    usuarioAtualNome = "";
    document.getElementById('username').value = '';
};

window.openNewItemModal = function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    document.getElementById('edit-modal-title').textContent = "Adicionar Novo Presente";
    editId.value = "";
    editName.value = "";
    editPrice.value = "";
    editIcon.value = "";
    editImagem.value = "";
    editPixKey.value = "";
    btnDelete.classList.add('hidden');
    editModal.classList.remove('hidden');
};

window.openEditModal = function(giftId) {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
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
};

window.openPixModal = function(giftId) {
    const gift = giftsData.find(g => g.id === giftId);
    if (!gift) return;

    itemAtualId = giftId;

    if(gift.reservadoPor) {
        modalReservadoPor.textContent = gift.reservadoPor;
        modalMensagemRecado.textContent = gift.mensagem || "Sem mensagem.";
        botoesAcaoPix.classList.remove('hidden');
    } else {
        modalReservadoPor.textContent = "Ainda não reservado";
        modalMensagemRecado.textContent = "";
        botoesAcaoPix.classList.add('hidden');
    }

    modalGiftName.textContent = gift.name;
    modalGiftValue.textContent = gift.price;
    pixCopiaCola.textContent = gift.pixKey;
    modalQrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gift.pixKey)}`;
    
    pixModal.classList.remove('hidden');
};

window.abrirReserva = function(giftId, nomeItem) {
    const gift = giftsData.find(g => g.id === giftId);
    if(gift && gift.reservadoPor) {
        alert("⚠️ Este presente já foi escolhido!");
        return;
    }
    reservaId.value = giftId;
    reservaNomeItem.textContent = nomeItem;
    reservaNome.value = usuarioAtualNome;
    reservaMensagem.value = "";
    reservaModal.classList.remove('hidden');
};

// ✅ REGRA: Reservar NÃO cria registro/log
window.confirmarReserva = async function(event) {
    event.preventDefault();
    const id = reservaId.value;
    const nomePessoa = reservaNome.value.trim();
    const mensagemPessoa = reservaMensagem.value.trim();

    try {
        const itemRef = ref(db, `gifts/${id}`);
        await update(itemRef, {
            reservadoPor: nomePessoa,
            mensagem: mensagemPessoa,
            status: 'reservado',
            dataReserva: new Date().toLocaleString('pt-BR')
        });

        alert("✅ Reserva confirmada! Agora efetue o pagamento.");
        closeModal('reserva-modal');
        openPixModal(id);

    } catch (erro) {
        alert("❌ Erro ao reservar.");
    }
};

// ✅ REGRA: Confirmar Compra SIM cria registro/log com nome do usuário
window.confirmarCompra = async function() {
    if(!itemAtualId) return;
    const itemAtual = giftsData.find(g => g.id === itemAtualId);
    if(!itemAtual) return;

    if(!confirm(`Confirmar compra de: ${itemAtual.name}?`)) return;

    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, {
            status: 'pago',
            dataPagamento: new Date().toLocaleString('pt-BR')
        });
        
        // ✅ Log mostra QUEM fez
        registrarLog("COMPRA CONFIRMADA", `Item: ${itemAtual.name} | Comprador: ${itemAtual.reservadoPor}`);
        alert("✅ Compra registrada no sistema!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro ao confirmar.");
    }
};

window.cancelarReserva = async function() {
    if(!itemAtualId) return;
    const itemAtual = giftsData.find(g => g.id === itemAtualId);
    if(!itemAtual) return;

    if(!confirm("Cancelar reserva?")) return;

    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, {
            reservadoPor: null,
            mensagem: null,
            status: null
        });
        registrarLog("RESERVA CANCELADA", `Item: ${itemAtual.name}`);
        alert("✅ Reserva cancelada!");
    } catch (erro) {
        alert("❌ Erro.");
    }
};

// ✅ REGRA: Reativar NÃO apaga histórico, apenas arquiva
window.reativarItem = async function(giftId) {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const itemAtual = giftsData.find(g => g.id === giftId);
    if(!itemAtual) return;

    if(!confirm("Reativar? Histórico será mantido.")) return;

    try {
        const itemRef = ref(db, `gifts/${giftId}`);
        await update(itemRef, {
            // Salva tudo o que aconteceu antes
            historicoCompleto: {
                responsavelAnterior: itemAtual.reservadoPor,
                mensagemAnterior: itemAtual.mensagem,
                statusAnterior: itemAtual.status,
                dataAcao: new Date().toLocaleString('pt-BR')
            },
            // Libera o item
            reservadoPor: null,
            mensagem: null,
            status: null
        });
        registrarLog("ITEM REATIVADO", `Item: ${itemAtual.name} | Histórico preservado.`);
        alert("✅ Item reativado!");
    } catch (erro) {
        alert("❌ Erro ao reativar.");
    }
};

window.abrirListaCompras = async function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const conteudo = document.getElementById('lista-compras-conteudo');
    conteudo.innerHTML = '';

    const itens = giftsData.filter(g => g.reservadoPor || g.historicoCompleto);
    
    if(itens.length === 0) {
        conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhuma movimentação.</p>';
    } else {
        itens.forEach(item => {
            const div = document.createElement('div');
            div.className = 'p-3 border rounded-lg mb-2 bg-white';
            div.innerHTML = `
                <p class="font-bold">${item.name} - ${item.price}</p>
                <p class="text-sm">👤 Por: ${item.reservadoPor || item.historicoCompleto?.responsavelAnterior || '---'}</p>
                <p class="text-sm italic">💬 Recado: ${item.mensagem || item.historicoCompleto?.mensagemAnterior || '---'}</p>
                <p class="text-xs text-blue-600">📌 Status: ${item.status || 'Disponível'}</p>
                <button onclick="reativarItem('${item.id}')" class="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">🔄 Reativar Item</button>
            `;
            conteudo.appendChild(div);
        });
    }
    document.getElementById('lista-compras-modal').classList.remove('hidden');
};

window.abrirLogs = async function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const conteudo = document.getElementById('logs-conteudo');
    conteudo.innerHTML = '';

    try {
        const logsRef = ref(db, 'logs');
        const snapshot = await get(logsRef);
        
        if(!snapshot.exists()) {
            conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhum registro.</p>';
        } else {
            let logs = [];
            snapshot.forEach(c => logs.unshift({id:c.key, ...c.val()}));

            logs.forEach(l => {
                const div = document.createElement('div');
                div.className = 'p-2 border-b text-sm';
                div.innerHTML = `
                    <span class="text-gray-500 text-xs">[${l.data}]</span>
                    <span class="font-semibold text-green-600"> ${l.tipo}</span>
                    <span>: ${l.descricao}</span>
                    <span class="text-purple-600 text-xs font-medium"> | 👤 Por: ${l.usuario || 'Sistema'}</span>
                `;
                conteudo.appendChild(div);
            });
        }
        document.getElementById('logs-modal').classList.remove('hidden');
    } catch (erro) {
        conteudo.innerHTML = `<p class="text-red-500">Erro ao carregar.</p>`;
    }
};

window.openSettingsModal = function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    cfgLoginTitle.value = siteConfig.loginTitle || "";
    cfgLoginSubtitle.value = siteConfig.loginSubtitle || "";
    cfgMainTitle.value = siteConfig.mainTitle || "";
    cfgWelcomeText.value = siteConfig.welcomeText || "";
    cfgBgImage.value = siteConfig.backgroundImage || "";
    cfgFooterText.value = siteConfig.footerText || "";
    settingsModal.classList.remove('hidden');
};

window.saveItem = async function(event) {
    event.preventDefault();
    if(!isAdmin) return;

    const dados = {
        name: editName.value.trim(),
        price: editPrice.value.trim(),
        icon: editIcon.value.trim(),
        imagem: editImagem.value.trim() || "",
        pixKey: editPixKey.value.trim()
    };

    try {
        if(editId.value) {
            await update(ref(db, `gifts/${editId.value}`), dados);
            registrarLog("EDIÇÃO", `Item alterado: ${dados.name}`);
        } else {
            await push(ref(db, 'gifts'), dados);
            registrarLog("CRIAÇÃO", `Novo item: ${dados.name}`);
        }
        closeModal('edit-modal');
    } catch (erro) {
        alert("❌ Erro ao salvar.");
    }
};

window.deleteItem = async function() {
    if(!isAdmin) return;
    if(confirm("Excluir permanentemente?")) {
        try {
            const nome = giftsData.find(g => g.id === editId.value)?.name;
            await remove(ref(db, `gifts/${editId.value}`));
            registrarLog("EXCLUSÃO", `Item removido: ${nome}`);
            closeModal('edit-modal');
        } catch (erro) {
            alert("❌ Erro ao excluir.");
        }
    }
};

window.saveSettings = async function(event) {
    event.preventDefault();
    if(!isAdmin) return;
    try {
        const cfg = {
            loginTitle: cfgLoginTitle.value,
            loginSubtitle: cfgLoginSubtitle.value,
            mainTitle: cfgMainTitle.value,
            welcomeText: cfgWelcomeText.value,
            backgroundImage: cfgBgImage.value,
            footerText: cfgFooterText.value
        };
        await update(ref(db, 'configuracoes'), cfg);
        registrarLog("CONFIGURAÇÕES", `Dados do site alterados`);
        closeModal('settings-modal');
    } catch (erro) {
        alert("❌ Erro ao salvar configurações.");
    }
};


// ==============================================
// FUNÇÕES DE APOIO
// ==============================================

function mostrarBotoesAdmin() {
    btnNewItem.classList.remove('hidden');
    btnSettings.classList.remove('hidden');
    btnListaCompras.classList.remove('hidden');
    btnLogs.classList.remove('hidden');
}

function atualizarSaudacao() {
    if(siteConfig.welcomeText) {
        welcomeText.textContent = siteConfig.welcomeText.replace('[NOME]', usuarioAtualNome);
    } else {
        welcomeText.textContent = `Olá, ${usuarioAtualNome}! Escolha seu presente.`;
    }
}

function registrarLog(tipo, descricao) {
    const agora = new Date();
    push(ref(db, 'logs'), {
        tipo: tipo,
        descricao: descricao,
        usuario: usuarioAtualNome, // ✅ Sempre salva quem fez
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR')
    });
}

function renderGifts() {
    giftsGrid.innerHTML = '';

    if(giftsData.length === 0) {
        giftsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full bg-white/80 p-4 rounded-xl">Nenhum presente cadastrado ainda.</p>';
        return;
    }

    giftsData.forEach(gift => {
        const card = document.createElement('div');
        card.className = `card-item rounded-xl shadow-lg overflow-hidden transform transition hover:scale-[1.02] ${gift.reservadoPor ? 'reservado' : ''}`;
        
        // Imagem de fundo do card
        if(gift.imagem) {
            card.style.backgroundImage = `url('${gift.imagem}')`;
        }

        card.innerHTML = `
            <div class="card-overlay"></div>
            <div class="card-content p-5 relative z-10">
                <div class="flex justify-between items-start mb-3">
                    <img src="${gift.icon}" alt="ícone" class="icon-img">
                    ${isAdmin ? `<button onclick="openEditModal('${gift.id}')" class="text-gray-600 hover:text-pink-500 text-lg">✏️</button>` : ''}
                </div>
                <h3 class="font-bold text-lg text-gray-800 mb-1">${gift.name}</h3>
                <p class="text-pink-600 font-semibold mb-3">${gift.price}</p>

                ${gift.reservadoPor ? `
                    <p class="text-xs text-gray-600 mb-2"><strong>Escolhido por:</strong> ${gift.reservadoPor}</p>
                ` : ''}

                <div class="mt-4 flex flex-col gap-2">
                    <button onclick="${gift.reservadoPor ? `openPixModal('${gift.id}')` : `abrirReserva('${gift.id}', '${gift.name.replace(/'/g, "\\'")}')`}" 
                        class="w-full py-2 rounded-lg text-sm font-semibold transition ${gift.reservadoPor ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}">
                        ${gift.reservadoPor ? 'Ver Detalhes' : 'Escolher Presente'}
                    </button>

                    ${isAdmin && gift.reservadoPor ? `
                        <button onclick="reativarItem('${gift.id}')" class="w-full py-1.5 rounded-lg text-xs font-semibold bg-green-500 hover:bg-green
