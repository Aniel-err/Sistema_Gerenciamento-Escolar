document.addEventListener("DOMContentLoaded", async () => {

    // ---------------- ALUNOS ----------------
    try {
        const resAlunos = await fetch("http://localhost:3000/listagem/alunos");
        const alunos = await resAlunos.json();

        const tabelaA = document.getElementById("tabela-alunos");

        alunos.forEach(a => {
            tabelaA.innerHTML += `
                <tr>
                    <td>${a.nome}</td>
                    <td>${a.matricula}</td>

                    
                </tr>
            `;
        });

    } catch (err) {
        console.error("Erro ao listar alunos:", err);
    }

    // ---------------- PROFESSORES ----------------
    try {
        const resProfs = await fetch("http://localhost:3000/listagem/professores");
        const profs = await resProfs.json();

        const tabelaP = document.getElementById("tabela-professores");

        profs.forEach(p => {
            tabelaP.innerHTML += `
                <tr>
                    <td>${p.nome}</td>
                    <td>${p.email}</td>
                    <td>${p.disciplina ?? "Não cadastrado"}</td>
                    <td>${p.cargo}</td>
                    <td>${p._id}</td>

                </tr>
            `;
        });

    } catch (err) {
        console.error("Erro ao listar professores:", err);
    }

});
