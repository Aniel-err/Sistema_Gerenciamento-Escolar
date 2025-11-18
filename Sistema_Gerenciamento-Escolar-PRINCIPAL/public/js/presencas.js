// -----------------------
// 0. LISTA DE ALUNOS (com ObjectId válidos)
// -----------------------
const alunos = [
    { id: "67b903e61c2a4b8d9f1a0001", nome: "Ana Paula" },
    { id: "67b903e61c2a4b8d9f1a0002", nome: "Rafael Mendes" },
    { id: "67b903e61c2a4b8d9f1a0003", nome: "Carla Souza" },
    { id: "67b903e61c2a4b8d9f1a0004", nome: "Lucas Andrade" }
];

// ELEMENTOS DA TELA
const listaAlunosDiv = document.getElementById("listaAlunos");
const detalhesDiv = document.getElementById("detalhesAluno");
const nomeAlunoTitulo = document.getElementById("nomeAluno");

let alunoSelecionado = null;
let statusSelecionado = null;

// -----------------------
// 1. GERAR LISTA DE ALUNOS
// -----------------------
function carregarLista() {
    listaAlunosDiv.innerHTML = "";

    alunos.forEach(aluno => {
        const item = document.createElement("div");
        item.classList.add("aluno-item");
        item.innerText = aluno.nome;

        item.addEventListener("click", () => abrirDetalhes(aluno));
        listaAlunosDiv.appendChild(item);
    });
}

function abrirDetalhes(aluno) {
    alunoSelecionado = aluno;
    nomeAlunoTitulo.innerText = aluno.nome;
    detalhesDiv.style.display = "block";
}

carregarLista();

// -----------------------
// 2. BOTÕES DE STATUS
// -----------------------
document.querySelectorAll(".btn[data-status]").forEach(btn => {
    btn.addEventListener("click", () => {
        statusSelecionado = btn.dataset.status;
        alert(`Status selecionado: ${statusSelecionado}`);
    });
});

// -----------------------
// 3. FUNÇÃO QUE SALVA NO BACKEND
// -----------------------
async function salvarPresenca(data) {
    try {
        const resposta = await fetch("http://localhost:3000/api/presencas/salvar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const json = await resposta.json();
        alert(json.mensagem || json.erro);

    } catch (erro) {
        alert("Erro ao salvar presença (frontend).");
        console.error("Erro:", erro);
    }
}

// -----------------------
// 4. BOTÃO SALVAR
// -----------------------
document.getElementById("btnSalvar").addEventListener("click", () => {

    if (!alunoSelecionado) {
        alert("Selecione um aluno primeiro!");
        return;
    }

    if (!statusSelecionado) {
        alert("Selecione um status (Presente, Ausente ou Atrasado)");
        return;
    }

    const registro = {
        alunoId: alunoSelecionado.id,
        status: statusSelecionado,
        uniforme: document.getElementById("uniforme").checked,
        material: document.getElementById("material").checked,
        comportamento: document.getElementById("comportamento").checked,
        observacao: document.getElementById("observacao").value
    };

    salvarPresenca(registro);
});

// -----------------------
// 5. SISTEMA DE TABS
// -----------------------
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

// -----------------------
// 6. CARREGAR RESUMO NO PAINEL (CORRIGIDO)
// -----------------------
async function carregarResumo() {
    try {
        const resposta = await fetch("http://localhost:3000/api/presencas/resumo");
        const dados = await resposta.json();

        document.getElementById("painel-presentes").innerText = dados.presentes + "%";
        document.getElementById("painel-ausentes").innerText = dados.ausentes + "%";
        document.getElementById("painel-atrasados").innerText = dados.atrasados + "%";

    } catch (erro) {
        console.error("Erro ao carregar resumo:", erro);
    }
}

// Atualiza quando clicar no painel
document.querySelector('[data-tab="painel"]').addEventListener("click", carregarResumo);
