let alunos = []; 
let alunoSelecionado = null;
let statusSelecionado = null; 

const listaAlunosDiv = document.getElementById("listaAlunos");
const detalhesDiv = document.getElementById("detalhesAluno");
const nomeAlunoTitulo = document.getElementById("nomeAluno");
const TOKEN_DE_AUTENTICACAO = localStorage.getItem('token'); 

async function buscarAlunosDoBackend() {
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


function carregarLista() {
    listaAlunosDiv.innerHTML = "";
    
    alunos.forEach(aluno => {
        const item = document.createElement("div");
        item.classList.add("aluno-item");
        
       
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
    
    document.getElementById("empty-state").style.display = "none";
    detalhesDiv.style.display = "flex"; 

    statusSelecionado = null;
    
    document.querySelectorAll('input[name="situacao"]').forEach(radio => {
        radio.checked = false;
    });

    document.getElementById("uniforme").checked = false;
    document.getElementById("material").checked = false;
    document.getElementById("comportamento").checked = false;
    document.getElementById("observacao").value = "";
}

document.addEventListener('DOMContentLoaded', buscarAlunosDoBackend); 


document.querySelectorAll('input[name="situacao"]').forEach(radioInput => { 
    radioInput.addEventListener('change', (evento) => {
        statusSelecionado = evento.target.value; 
        
        console.log(`Status selecionado: ${statusSelecionado}`);
    });
});


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
        
        alert(json.mensagem || "Presença registrada com sucesso!");
        
        buscarAlunosDoBackend(); 
        
    } catch (erro) {
        alert(`ERRO ao salvar presença: ${erro.message}`);
        console.error("Erro ao salvar presença:", erro);
    }
}



const btnSalvar = document.getElementById("btnSalvar");

if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
        if (!alunoSelecionado) {
            alert("Selecione um aluno primeiro!");
            return;
        }
        
        if (!statusSelecionado) {
            const radioStatus = document.querySelector('input[name="situacao"]:checked');
            if (radioStatus) {
                statusSelecionado = radioStatus.value;
            }
        }
        
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
        
        if (tabContentId === 'painel') {
             console.log("Aba Resumo do Dia aberta.");
        }
    });
});