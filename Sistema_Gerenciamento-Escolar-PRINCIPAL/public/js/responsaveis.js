function setActiveLink() {
    const currentPath = window.location.pathname;
    
    const links = document.querySelectorAll('.sidebar-nav ul li a');

    links.forEach(link => {
        link.classList.remove('active');

        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } 
   
        else if (currentPath.includes('responsaveis.html') && link.getAttribute('href') === 'alunos.html') {
             link.classList.add('active');
        }
    });
}

setActiveLink();


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); 
    const API_BASE_URL = 'http://localhost:3000';
    
    const corpoTabela = document.getElementById('corpoTabelaResponsaveis');
    const formCadastro = document.getElementById('formCadastroResponsavel');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');
    const inputTelefone = document.getElementById('telefone');
    const inputAlunoId = document.getElementById('alunoId');
    const btnSalvar = formCadastro.querySelector('button[type="submit"]');

    let isEditing = false;
    let currentResponsavelId = null;

    async function listarResponsaveis() {
        try {
            if (!token) {
                alert("Você não está logado ou seu token expirou.");
                return;
            }

            const response = await fetch(`${API_BASE_URL}/responsaveis`, {
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
                throw new Error('Erro ao carregar a lista de responsáveis.');
            }

            const responsaveis = await response.json();
            
            corpoTabela.innerHTML = ''; 

            if (responsaveis.length === 0) {
                corpoTabela.innerHTML = `<tr><td colspan="4">Nenhum responsável cadastrado.</td></tr>`;
                return;
            }

            responsaveis.forEach(responsavel => {
                const tr = document.createElement('tr');
                
                const nomeAluno = responsavel.aluno ? responsavel.aluno.nome || responsavel.aluno : 'N/A';
                
                tr.innerHTML = `
                    <td>${responsavel.nome}</td>
                    <td>${responsavel.email}</td>
                    <td>${nomeAluno}</td>
                    <td>
                        <button class="btn btn-sm btn-info btn-editar" data-id="${responsavel._id}">Editar</button>
                        <button class="btn btn-sm btn-danger btn-excluir" data-id="${responsavel._id}">Excluir</button>
                    </td>
                `;
                corpoTabela.appendChild(tr);
            });
            
            document.querySelectorAll('.btn-excluir').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const responsavelId = e.target.getAttribute('data-id');
                    
                    if (!confirm("Tem certeza que deseja excluir este responsável?")) {
                        return;
                    }
                    
                    try {
                        const response = await fetch(`${API_BASE_URL}/responsaveis/${responsavelId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (response.ok) {
                            alert("Responsável excluído com sucesso!");
                            listarResponsaveis();
                        } else {
                            const data = await response.json();
                            alert(`Erro ao excluir: ${data.mensagem || 'Erro desconhecido.'}`);
                        }
                    } catch (error) {
                        console.error('Erro de rede ao excluir:', error);
                        alert("Erro de conexão ao excluir responsável.");
                    }
                });
            });

            document.querySelectorAll('.btn-editar').forEach(button => {
                button.addEventListener('click', (e) => {
                    const responsavelId = e.target.getAttribute('data-id');
                    const responsavel = responsaveis.find(r => r._id === responsavelId);

                    if (responsavel) {
                        inputNome.value = responsavel.nome;
                        inputEmail.value = responsavel.email;
                        inputTelefone.value = responsavel.telefone || '';
                        inputAlunoId.value = responsavel.aluno && responsavel.aluno._id ? responsavel.aluno._id : responsavel.aluno;

                        isEditing = true;
                        currentResponsavelId = responsavelId;
                        btnSalvar.textContent = "Salvar Edição";
                        alert(`Editando Responsável ID: ${responsavelId}`);
                    }
                });
            });

        } catch (error) {
            console.error('Erro na requisição GET:', error);
            corpoTabela.innerHTML = `<tr><td colspan="4">Erro ao carregar responsáveis: ${error.message}</td></tr>`;
        }
    }

    listarResponsaveis();


    formCadastro.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const responsavelData = {
            nome: inputNome.value,
            email: inputEmail.value,
            telefone: inputTelefone.value,
            alunoMatricula: inputAlunoId.value 
        };

        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE_URL}/responsaveis/${currentResponsavelId}` : `${API_BASE_URL}/responsaveis`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(responsavelData)
            });

            const data = await response.json();
            const action = isEditing ? "editado" : "cadastrado";

            if (response.ok) {
                alert(data.mensagem || `Responsável ${action} com sucesso!`);
                
                // Reseta o estado
                formCadastro.reset(); 
                isEditing = false;
                currentResponsavelId = null;
                btnSalvar.textContent = "Salvar Responsável";
                
                listarResponsaveis(); 

            } else {
                alert(`Erro ao ${action}: ${data.erro || data.mensagem || 'Erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            alert("Erro de conexão com o servidor. Verifique o console.");
        }
    });
});