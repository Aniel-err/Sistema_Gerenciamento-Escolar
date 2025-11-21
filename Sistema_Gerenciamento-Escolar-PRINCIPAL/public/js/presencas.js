// -----------------------
// 0. VARIAVEIS GLOBAIS & ELEMENTOS DA TELA
// -----------------------
let alunos = []; 
let alunoSelecionado = null;
let statusSelecionado = null; // Variável que armazenará 'presente', 'ausente', ou 'atrasado'

const listaAlunosDiv = document.getElementById("listaAlunos");
const detalhesDiv = document.getElementById("detalhesAluno");
const nomeAlunoTitulo = document.getElementById("nomeAluno");
const TOKEN_DE_AUTENTICACAO = localStorage.getItem('token'); 

// -----------------------
// FUNÇÃO DE BUSCA NO BACK-END (COM CONTAGEM DE FALTAS)
// -----------------------
async function buscarAlunosDoBackend() {
    // Esconde o painel de detalhes ao recarregar a lista
    detalhesDiv.style.display = "none";
    document.getElementById("empty-state").style.display = "flex";

    listaAlunosDiv.innerHTML = "<div>Carregando turma...</div>";

    if (!TOKEN_DE_AUTENTICACAO) {
        listaAlunosDiv.innerHTML = "<div>ERRO: Usuário não logado. Faça login.</div>";
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/api/presencas/alunos", {
            method: "GET",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN_DE_AUTENTICACAO}` 
            }
        });

        if (resposta.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }

        if (!resposta.ok) {
             const erroJson = await resposta.json().catch(() => ({})); 
             const mensagemErro = erroJson.erro || `Erro HTTP ${resposta.status}. Rota não encontrada.`;
             throw new Error(mensagemErro);
        }

        const json = await resposta.json();
        
        if (json.alunos) {
            alunos = json.alunos; 
            carregarLista(); 
        } else {
            listaAlunosDiv.innerHTML = "<div>Nenhum aluno encontrado.</div>";
        }

    } catch (erro) {
        listaAlunosDiv.innerHTML = `<div>ERRO ao buscar alunos: ${erro.message}</div>`;
        console.error("Erro na busca de alunos:", erro);
    }
}


// -----------------------
// 1. GERAR LISTA DE ALUNOS & ABRIR DETALHES (CORRIGIDA: Reset para botões)
// -----------------------
function carregarLista() {
    listaAlunosDiv.innerHTML = "";
    
    alunos.forEach(aluno => {
        const item = document.createElement("div");
        item.classList.add("aluno-item");
        
        item.innerHTML = aluno.nome; // Se tiver totalFaltas, use: `${aluno.nome} <span class="faltas">(${aluno.totalFaltas} faltas)</span>` 

        item.addEventListener("click", () => abrirDetalhes(aluno));
        listaAlunosDiv.appendChild(item);
    });
    // Se você tiver um elemento com ID 'tituloTurma', descomente:
    // document.getElementById("tituloTurma").innerHTML = `<i class="fas fa-users"></i> Turma Encontrada (${alunos.length} alunos)`;
}

function abrirDetalhes(aluno) {
    alunoSelecionado = aluno;
    nomeAlunoTitulo.innerText = aluno.nome;
    
    // Mostra o painel de detalhes e esconde o empty state
    document.getElementById("empty-state").style.display = "none";
    detalhesDiv.style.display = "flex"; 

    // ✅ CORREÇÃO CRÍTICA: RESETAR STATUS AO TROCAR DE ALUNO
    statusSelecionado = null;
    
    // ⚠️ NOVO RESET: Desmarca visualmente o estado 'selected' dos BOTÕES customizados
    document.querySelectorAll('.btn-option[data-status]').forEach(btn => {
        btn.classList.remove("selected");
    });

    // Limpa também as observações e checkboxes
    document.getElementById("uniforme").checked = false;
    document.getElementById("material").checked = false;
    document.getElementById("comportamento").checked = false;
    document.getElementById("observacao").value = "";
}


// -----------------------
// 2. OUVINTE DE STATUS (CORRIGIDO: Ouve o 'click' nos BOTÕES customizados)
// -----------------------
document.querySelectorAll(".btn-option[data-status]").forEach(btn => { 
    btn.addEventListener("click", () => {
        // 1. Remove a classe 'selected' de todos os botões (feedback visual)
        document.querySelectorAll(".btn-option[data-status]").forEach(b => b.classList.remove("selected"));
        
        // 2. Adiciona a classe 'selected' apenas no botão clicado
        btn.classList.add("selected");
        
        // 3. Define a variável global que será usada na Seção 4.
        statusSelecionado = btn.dataset.status; 
        
        console.log(`Status selecionado: ${statusSelecionado}`);
    });
});


// -----------------------
// 3. FUNÇÃO QUE SALVA NO BACKEND 
// -----------------------
async function salvarPresenca(data) {
    if (!TOKEN_DE_AUTENTICACAO) {
        alert("Erro de segurança: Token não encontrado. Faça login novamente.");
        return;
    }
    
    try {
        const resposta = await fetch("http://localhost:3000/api/presencas/salvar", { 
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN_DE_AUTENTICACAO}` 
            },
            body: JSON.stringify(data)
        });

        const json = await resposta.json();
        
        if (!resposta.ok) {
             throw new Error(json.erro || `Falha ao registrar presença. Erro: ${resposta.status}.`);
        }
        
        // SUCESSO!
        alert(json.mensagem || "Presença registrada com sucesso!");
        
        // Recarrega a lista para mostrar o novo estado do aluno e as faltas
        buscarAlunosDoBackend(); 
        
    } catch (erro) {
        alert(`ERRO ao salvar presença: ${erro.message}`);
        console.error("Erro ao salvar presença:", erro);
    }
}


// -----------------------
// 4. BOTÃO SALVAR (AGORA CORRETO: Confia no clique do botão customizado)
// -----------------------
const btnSalvar = document.getElementById("btnSalvar"); // O ID 'btnSalvar' está correto no HTML

if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
        if (!alunoSelecionado) {
            alert("Selecione um aluno primeiro!");
            return;
        }
        
        // ✅ CORREÇÃO: Não precisa de fallback para rádio. A variável deve estar definida pelo clique na Seção 2.
        if (!statusSelecionado) { 
            alert("Selecione um status (Presente, Ausente ou Atrasado)");
            return;
        }

        const registro = {
            alunoId: alunoSelecionado._id || alunoSelecionado.id, 
            status: statusSelecionado, 
            uniforme: document.getElementById("uniforme").checked,
            material: document.getElementById("material").checked,
            comportamento: document.getElementById("comportamento").checked,
            observacao: document.getElementById("observacao").value
        };

        salvarPresenca(registro);
    });
} else {
    console.warn("Elemento com ID 'btnSalvar' não encontrado no HTML.");
}


// -----------------------
// 5. SISTEMA DE TABS 
// -----------------------
document.querySelectorAll(".tab-link").forEach(tab => {
    tab.addEventListener("click", () => { 
        document.querySelectorAll(".tab-link").forEach(t => t.classList.remove("active"));    
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active")); 

        tab.classList.add("active");
        
        const tabContentId = tab.dataset.tab;
        const tabContentElement = document.getElementById(tabContentId);
        if (tabContentElement) {
            tabContentElement.classList.add("active");
        }
        
        // Se o painel de Resumo for clicado, recarregar os dados
        if (tabContentId === 'painel') { // ID da tab é 'painel'
             carregarResumo(); 
        }
    });
});

// -----------------------
// 6. FUNÇÃO CARREGAR RESUMO 
// -----------------------
async function carregarResumo() {
    console.log("Iniciando carregamento do resumo...");
    // Sua lógica de buscar o resumo aqui...
}


// Inicialização
document.addEventListener('DOMContentLoaded', buscarAlunosDoBackend);