// -----------------------
// 0. VARIAVEIS GLOBAIS & ELEMENTOS DA TELA
// -----------------------
let alunos = []; 
let alunoSelecionado = null;
let statusSelecionado = null; // ESSA VARIÁVEL SERÁ ATUALIZADA NO CLIQUE DOS BOTÕES DE STATUS

const listaAlunosDiv = document.getElementById("listaAlunos");
const detalhesDiv = document.getElementById("detalhesAluno");
const nomeAlunoTitulo = document.getElementById("nomeAluno");
const TOKEN_DE_AUTENTICACAO = localStorage.getItem('token'); 

// -----------------------
// FUNÇÃO DE BUSCA NO BACK-END (COM CONTAGEM DE FALTAS)
// -----------------------
async function buscarAlunosDoBackend() {
    // 1. Ocultar o painel de detalhes se um aluno foi deselecionado
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
            alunos = json.alunos; // Dados agora incluem 'totalFaltas'
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
// 1. GERAR LISTA DE ALUNOS
// -----------------------
function carregarLista() {
    listaAlunosDiv.innerHTML = "";
    
    alunos.forEach(aluno => {
        const item = document.createElement("div");
        item.classList.add("aluno-item");
        
        // Exibe o total de faltas
        item.innerHTML = `
            ${aluno.nome} 
            <span class="faltas">(${aluno.totalFaltas} faltas)</span>
        `; 

        item.addEventListener("click", () => abrirDetalhes(aluno));
        listaAlunosDiv.appendChild(item);
    });
    document.getElementById("tituloTurma").innerHTML = `<i class="fas fa-users"></i> Turma Encontrada (${alunos.length} alunos)`;
}

function abrirDetalhes(aluno) {
    alunoSelecionado = aluno;
    nomeAlunoTitulo.innerText = aluno.nome;
    
    // Mostra o painel de detalhes e esconde o empty state
    document.getElementById("empty-state").style.display = "none";
    detalhesDiv.style.display = "flex"; 

    // NOVO CÓDIGO CRÍTICO: RESETAR O STATUS E O INPUT RADIO
    statusSelecionado = null;
    
    // Desmarca visualmente todos os inputs de rádio ao trocar de aluno
    document.querySelectorAll('input[name="situacao"]').forEach(radio => {
        radio.checked = false;
    });

    // Limpa também as observações e checkboxes
    document.getElementById("uniforme").checked = false;
    document.getElementById("material").checked = false;
    document.getElementById("comportamento").checked = false;
    document.getElementById("observacao").value = "";
}
// Inicialização
document.addEventListener('DOMContentLoaded', buscarAlunosDoBackend); 


// -----------------------
// 2. OUVINTE DE STATUS (AGORA CORRETO): Usa o evento 'change' nos inputs de rádio
// -----------------------
document.querySelectorAll('input[name="situacao"]').forEach(radioInput => { 
    radioInput.addEventListener('change', (evento) => {
        // Define a variável global que será usada na Seção 4.
        statusSelecionado = evento.target.value; 
        
        console.log(`Status selecionado: ${statusSelecionado}`);
    });
});
// OBS: Você pode precisar ajustar o seu CSS para o input de rádio
// ficar visualmente "selecionado", já que removemos a classe 'selected'

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
                "Authorization": `Bearer ${TOKEN_DE_AUTENTICACAO}` // ENVIANDO O TOKEN
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
// 4. BOTÃO SALVAR (Usa o ID 'btnSalvar' e a lógica de rádio)
// -----------------------
const btnSalvar = document.getElementById("btnSalvar");

if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
        if (!alunoSelecionado) {
            alert("Selecione um aluno primeiro!");
            return;
        }
        
        // Fallback: Busca o status no HTML se a variável global estiver nula
        if (!statusSelecionado) {
            const radioStatus = document.querySelector('input[name="situacao"]:checked');
            if (radioStatus) {
                statusSelecionado = radioStatus.value;
            }
        }
        
        // Se ainda estiver nulo, dispara o alerta
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
        if (tabContentId === 'painel') {
             // Chamada da função real de carregar resumo (se existir)
             // carregarResumoReal(); 
             console.log("Aba Resumo do Dia aberta.");
        }
    });
});