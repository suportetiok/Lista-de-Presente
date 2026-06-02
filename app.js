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


// FUNÇÕES GLOBAIS
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
        console.error("ERRO LOGIN EMAIL:", erro);
        let mensagemErro = "❌ Erro ao entrar.";
        if(erro.code === 'auth/user-not-found') mensagemErro = "❌ Usuário não cadastrado.";
        if(erro.code === 'auth/wrong-password') mensagemErro = "❌ Senha incorreta.";
        if(erro.code === 'auth/invalid-email') mensagemErro = "❌ E-mail inválido.";
        alert(mensagemErro);
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
        alert("✅ Logado com Google como Administrador!");
    } catch (erro) {
        console.error("ERRO GOOGLE:", erro);
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
        screenLogin.classList.add('hidden');
        screenDashboard.classList.remove('hidden');
        btnNewItem.classList.add('hidden');
        btnSettings.classList.add('hidden');
        btnListaCompras.classList.add('hidden');
        btnLogs.classList.add('hidden');
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
    if(!editModal || !isAdmin) { alert("❌ Acesso restrito ao administrador!"); return; }
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
    if(!isAdmin) { alert("❌ Acesso restrito ao administrador!"); return; }
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
        alert("⚠️ Este presente já foi escolhido por outra pessoa!");
        return;
    }
    reservaId.value = giftId;
    reservaNomeItem.textContent = nomeItem;
    reservaNome.value = usuarioAtualNome;
    reservaMensagem.value = "";
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
            mensagem: mensagemPessoa,
            status: 'reservado',
            dataReserva: new Date().toLocaleString('pt-BR')
        });

        registrarLog("RESERVA", `Item reservado por: ${nomePessoa} | Item: ${reservaNomeItem.textContent}`);
        alert("✅ Reserva confirmada! Agora é só pagar o PIX.");
        closeModal('reserva-modal');
        openPixModal(id);

    } catch (erro) {
        alert("❌ Erro ao reservar: " + erro.message);
    }
};

window.confirmarCompra = async function() {
    if(!itemAtualId) return;
    const itemAtual = giftsData.find(g => g.id === itemAtualId);
    if(!itemAtual) return;

    if(!confirm(`Tem certeza? Marcar como PAGO. Responsável: ${itemAtual.reservadoPor}`)) return;

    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, {
            status: 'pago',
            dataPagamento: new Date().toLocaleString('pt-BR')
        });
        registrarLog("VENDA CONFIRMADA", `Item pago por: ${itemAtual.reservadoPor} | Item: ${itemAtual.name}`);
        alert("✅ Compra confirmada com sucesso!");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.cancelarReserva = async function() {
    if(!itemAtualId) return;
    const itemAtual = giftsData.find(g => g.id === itemAtualId);
    if(!itemAtual) return;

    if(!confirm("Cancelar reserva? O item volta a ficar disponível, mas guardaremos o histórico desta reserva.")) return;

    try {
        const itemRef = ref(db, `gifts/${itemAtualId}`);
        await update(itemRef, {
            reservadoPor: null,
            status: 'historico_cancelado', 
            ultimoResponsavel: itemAtual.reservadoPor,
            ultimaMensagem: itemAtual.mensagem,
            ultimaData: itemAtual.dataReserva
        });
        registrarLog("RESERVA CANCELADA", `Cancelado de: ${itemAtual.reservadoPor} | Item: ${itemAtual.name}`);
        alert("✅ Reserva cancelada! Item liberado e histórico salvo.");
        closeModal('pix-modal');
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.reativarItem = async function(giftId) {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const itemAtual = giftsData.find(g => g.id === giftId);
    if(!itemAtual) return;

    if(!confirm("Reativar item? Ele aparecerá como NOVO, mas o histórico da compra anterior ficará salvo nos dados do sistema.")) return;

    try {
        const itemRef = ref(db, `gifts/${giftId}`);
        await update(itemRef, {
            reservadoPor: null,
            mensagem: null,
            status: null,
            dataReativacao: new Date().toLocaleString('pt-BR')
        });
        registrarLog("ITEM REATIVADO", `Item reativado pelo ADM. Histórico anterior preservado. Item: ${itemAtual.name}`);
        alert("✅ Item reativado com sucesso! Histórico preservado.");
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};

window.abrirListaCompras = async function() {
    if(!isAdmin) { alert("❌ Acesso restrito!"); return; }
    const conteudo = document.getElementById('lista-compras-conteudo');
    conteudo.innerHTML = '';

    const itensProcessados = giftsData.filter(g => g.reservadoPor || g.ultimoResponsavel);
    
    if(itensProcessados.length === 0) {
        conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhuma movimentação registrada.</p>';
    } else {
        itensProcessados.forEach(item => {
            const nomeExibido = item.reservadoPor || item.ultimoResponsavel || "Desconhecido";
            const msgExibida = item.mensagem || item.ultimaMensagem || "---";
            const statusExibido = item.status || "Disponível / Histórico";
            const classeStatus = statusExibido === 'pago' ? 'text-green-600' : statusExibido === 'reservado' ? 'text-orange-500' : 'text-blue-600';

            const div = document.createElement('div');
            div.className = 'p-3 border border-gray-200 rounded-lg bg-white shadow-sm mb-2';
            div.innerHTML = `
                <p class="font-bold text-pink-700">${item.name} - ${item.price}</p>
                <p class="text-sm"><strong>👤 Responsável:</strong> ${nomeExibido}</p>
                <p class="text-sm italic text-gray-600"><strong>💬 Recado:</strong> ${msgExibida}</p>
                <p class="text-xs font-bold ${classeStatus}"><strong>📌 Status:</strong> ${statusExibido.toUpperCase()}</p>
                <p class="text-xs text-gray-500"><strong>📅 Data:</strong> ${item.dataReserva || item.ultimaData || 'Não informada'}</p>
                <button onclick="reativarItem('${item.id}')" class="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                    🔄 Reativar Item
                </button>
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
            conteudo.innerHTML = '<p class="text-gray-500 text-center">Nenhuma alteração registrada.</p>';
        } else {
            let listaLogs = [];
            snapshot.forEach(child => {
                listaLogs.unshift({ id: child.key, ...child.val() });
            });

            listaLogs.forEach(log => {
                const div = document.createElement('div');
                div.className = 'p-2 border-b border-gray-100';
                div.innerHTML = `
                    <span class="text-gray-500 text-xs">[${log.data} ${log.hora}]</span> 
                    <span class="font-semibold ${log.tipo.includes('VENDA') ? 'text-green-600' : log.tipo.includes('RESERVA') ? 'text-orange-500' : 'text-blue-600'}">${log.tipo}</span>
                    <span class="text-gray-700">: ${log.descricao}</span>
                    <span class="text-xs text-purple-600 font-medium"> | Por: ${log.usuario || 'Sistema'}</span>
                `;
                conteudo.appendChild(div);
            });
        }
        document.getElementById('logs-modal').classList.remove('hidden');
    } catch (erro) {
        conteudo.innerHTML = `<p class="text-red-500 text-center">Erro ao carregar logs: ${erro.message}</p>`;
        document.getElementById('logs-modal').classList.remove('hidden');
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
            registrarLog("EDIÇÃO", `Item alterado: ${item.name}`);
            alert("✅ Item atualizado!");
        } else {
            const giftsRef = ref(db, 'gifts');
            const novoItemRef = await push(giftsRef, item);
            registrarLog("CRIACAO", `Novo item criado: ${item.name}`);
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
            const nomeExcluido = giftsData.find(g => g.id === editId.value)?.name || editId.value;
            const itemRef = ref(db, `gifts/${editId.value}`);
            await remove(itemRef);
            registrarLog("EXCLUSAO", `Item EXCLUÍDO do sistema: ${nomeExcluido}`);
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
        registrarLog("CONFIGURAÇÕES", `Dados do site alterados`);
        closeModal('settings-modal');
        alert("✅ Configurações salvas!");
    } catch (erro) {
        alert("❌ Erro: " + erro.message);
    }
};


document.addEventListener("DOMContentLoaded", () => {
    const giftsRef = ref(db, 'gifts');
    const configRef = ref(db, 'configuracoes');

    onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
            siteConfig = snapshot.val();
            
            document.getElementById('login-title').textContent = siteConfig.loginTitle || "Lista de Presentes";
            document.getElementById('login-subtitle').textContent = siteConfig.loginSubtitle || "Identifique-se para acessar";
            document.getElementById('main-title').textContent = siteConfig.mainTitle || "Presentes";
            footerText.textContent = siteConfig.footerText || "© 2026 Lista de Presentes";

            if(siteConfig.backgroundImage && paginaPrincipal) {
                paginaPrincipal.style.backgroundImage = `url("${siteConfig.backgroundImage}")`;
            }

            if(usuarioAtualNome !== "") atualizarSaudacao();

        } else {
            set(configRef, {
                loginTitle: "Lista de Presentes",
                loginSubtitle: "Identifique-se para acessar
