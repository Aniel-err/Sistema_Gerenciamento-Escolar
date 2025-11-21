document.addEventListener("DOMContentLoaded", carregarEventos);

async function api(url, metodo = "GET", corpo = null) {
    const token = localStorage.getItem("token");

    const config = {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    };

    if (corpo) config.body = JSON.stringify(corpo);

    const resposta = await fetch(url, config);

    if (!resposta.ok) {
        throw new Error("Erro: " + resposta.status);
    }

    return resposta.json();
}

// Carregar eventos
async function carregarEventos() {
    try {
        const eventos = await api("http://localhost:3000/eventos");

        console.log("Eventos carregados:", eventos);

        const lista = document.getElementById("eventos"); // CORRIGIDO
        lista.innerHTML = "";

        eventos.forEach(ev => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <h3>${ev.titulo}</h3>
                <p>${ev.descricao || ""}</p>
                <p><strong>Início:</strong> ${new Date(ev.dataInicio).toLocaleString()}</p>
                <p><strong>Fim:</strong> ${ev.dataFim ? new Date(ev.dataFim).toLocaleString() : "—"}</p>
                <p><strong>Local:</strong> ${ev.local || "—"}</p>
                <p><strong>Turmas:</strong> ${ev.turmas?.join(", ")}</p>

                <button onclick="editar('${ev._id}')">Editar</button>
                <button onclick="deletarEvento('${ev._id}')">Excluir</button>
            `;

            lista.appendChild(card);
        });

    } catch (erro) {
        alert("Erro ao carregar eventos");
        console.error(erro);
    }
}

// SALVAR EVENTO
document.getElementById("formEvento").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("idEvento").value;

    const dados = {
        titulo: document.getElementById("titulo").value,
        descricao: document.getElementById("descricao").value,
        dataInicio: document.getElementById("dataInicio").value,
        dataFim: document.getElementById("dataFim").value,
        local: document.getElementById("local").value,
        turmas: document.getElementById("turmas").value.split(",").map(t => t.trim())
    };

    try {
        if (id)
            await api(`http://localhost:3000/eventos/${id}`, "PUT", dados);
        else
            await api("http://localhost:3000/eventos", "POST", dados);

        carregarEventos();
        document.getElementById("formEvento").reset();
        document.getElementById("idEvento").value = "";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao salvar evento");
    }
});

// EDITAR
window.editar = async function (id) {
    try {
        const ev = await api(`http://localhost:3000/eventos/${id}`);

        document.getElementById("idEvento").value = ev._id;
        document.getElementById("titulo").value = ev.titulo;
        document.getElementById("descricao").value = ev.descricao || "";
        document.getElementById("dataInicio").value = ev.dataInicio.slice(0, 16);
        document.getElementById("dataFim").value = ev.dataFim ? ev.dataFim.slice(0, 16) : "";
        document.getElementById("local").value = ev.local || "";
        document.getElementById("turmas").value = ev.turmas?.join(",") || "";
    } catch (erro) {
        console.error(erro);
        alert("Erro ao carregar evento");
    }
};

// DELETAR
window.deletarEvento = async function (id) {
    if (!confirm("Deseja excluir?")) return;

    try {
        await api(`http://localhost:3000/eventos/${id}`, "DELETE");
        carregarEventos();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao excluir evento");
    }
};
