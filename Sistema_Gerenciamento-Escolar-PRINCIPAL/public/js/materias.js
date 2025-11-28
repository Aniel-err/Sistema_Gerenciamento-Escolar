document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 
    const API_BASE_URL = 'http://localhost:3000';
    
    const corpoTabela = document.getElementById('corpoTabelaMaterias');
    const formCadastro = document.getElementById('formCadastroMateria');
    const inputNome = document.getElementById('nome');
    const inputProfessor = document.getElementById('professor');
    const btnSalvar = formCadastro.querySelector('button[type="submit"]');

    let isEditing = false;
    let currentMateriaId = null;

    async function listarMaterias() {
        try {
            if (!token) {
                alert("Você não está logado ou seu token expirou.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/materias`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                alert("Acesso não autorizado! Verifique suas permissões.");
                return;
            }
            
            if (!response.ok) {
                throw new Error('Erro ao carregar a lista de matérias.');
            }

            const materias = await response.json();
            
            corpoTabela.innerHTML = ''; 

            if (materias.length === 0) {
                corpoTabela.innerHTML = `<tr><td colspan="3">Nenhuma matéria cadastrada.</td></tr>`;
                return;
            }

            materias.forEach(materia => {
                const tr = document.createElement('tr');
                
                const nomeProfessor = materia.professor ? materia.professor.nome || materia.professor : 'N/A';
                
                tr.innerHTML = `
                    <td>${materia.nome}</td>
                    <td>${nomeProfessor}</td>
                    <td>
                        <button class="btn btn-sm btn-info btn-editar" data-id="${materia._id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-excluir" data-id="${materia._id}">Excluir</button>
                    </td>
                `;
                corpoTabela.appendChild(tr);
            });
            
            document.querySelectorAll('.btn-excluir').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const materiaId = e.target.getAttribute('data-id');
                    
                    if (!confirm("Tem certeza que deseja excluir esta matéria?")) {
                        return;
                    }
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/materias/${materiaId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            alert("Matéria excluída com sucesso!");
                            listarMaterias();
                        } else {
                            const data = await response.json();
                            alert(`Erro ao excluir: ${data.mensagem || 'Erro desconhecido.'}`);
                        }
                    } catch (error) {
                        console.error('Erro de rede ao excluir:', error);
                        alert("Erro de conexão ao excluir matéria.");
                    }
                });
            });

            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', (e) => {
                    const materiaId = e.target.getAttribute('data-id');
                    const materia = materias.find(m => m._id === materiaId);

                    if (materia) {
                        inputNome.value = materia.nome;
                        inputProfessor.value = materia.professor && materia.professor._id ? materia.professor._id : materia.professor;

                        isEditing = true;
                        currentMateriaId = materiaId;
                        btnSalvar.textContent = "Salvar Edição";
                        alert(`Editando Matéria ID: ${materiaId}`);
                    }
                });
            });

        } catch (error) {
            console.error('Erro na requisição GET:', error);
            corpoTabela.innerHTML = `<tr><td colspan="3">Erro ao carregar matérias: ${error.message}</td></tr>`;
        }
    }

    listarMaterias();

    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const nome = inputNome.value;
        const professor = inputProfessor.value;

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE_URL}/materias/${currentMateriaId}` : `${API_BASE_URL}/materias`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    nome: nome,
                    professor: professor 
                })
            });

            const data = await response.json();
            const action = isEditing ? "editada" : "cadastrada";

            if (response.ok) {
                alert(data.mensagem || `Matéria ${action} com sucesso!`);
                
                // Reseta o estado
                formCadastro.reset(); 
                isEditing = false;
                currentMateriaId = null;
                btnSalvar.textContent = "Salvar Matéria";
                
                listarMaterias(); 

            } else {
                alert(`Erro ao ${action}: ${data.erro || data.mensagem || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            alert("Erro de conexão com o servidor. Verifique o console.");
        }
    });
});