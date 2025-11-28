document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
    const isAdmin = usuarioLogado && usuarioLogado.tipo === 'admin';
    const API_BASE_URL = 'http://localhost:3000';

    const btnContainer = document.getElementById('btnContainer');

    const modalAluno = document.getElementById('modalAluno');
    const modalProfessor = document.getElementById('modalProfessor');
 
    window.irParaCadastroResponsaveis = () => {
        window.location.href = 'responsaveis.html';
    };

    function atualizarBotoesHeader(abaAtiva) {
        btnContainer.innerHTML = '';

        if (abaAtiva === 'tab-alunos') {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.innerHTML = '<i class="fas fa-plus"></i> Novo Aluno';
            btn.onclick = () => openModal(modalAluno);
            btnContainer.appendChild(btn);
        } else if (abaAtiva === 'tab-professores' && isAdmin) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.innerHTML = '<i class="fas fa-plus"></i> Novo Professor';
            btn.onclick = () => openModal(modalProfessor);
            btnContainer.appendChild(btn);
        } else if (abaAtiva === 'tab-responsaveis') { 
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.style.backgroundColor = '#1abc9c';
            btn.style.borderColor = '#1abc9c';
            btn.innerHTML = '<i class="fas fa-plus"></i> Novo Responsável';
            btn.onclick = () => irParaCadastroResponsaveis();
            btnContainer.appendChild(btn);
        }
    }

    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            link.classList.add('active');
            const tabId = link.dataset.tab;
            document.getElementById(tabId).classList.add('active');

            atualizarBotoesHeader(tabId);
            
            if (tabId === 'tab-alunos') {
                carregarAlunos();
            } else if (tabId === 'tab-professores') {
                carregarProfessores();
            } else if (tabId === 'tab-responsaveis') { 
                carregarResponsaveis(); 
            }
        });
    });

    function openModal(modal) { modal.classList.add('show'); }
    function closeModal(modal) { 
        modal.classList.remove('show'); 
        modal.querySelector('form').reset();
    }

    document.getElementById('closeModalAluno').onclick = () => closeModal(modalAluno);
    document.getElementById('cancelModalAluno').onclick = () => closeModal(modalAluno);
    document.getElementById('closeModalProf').onclick = () => closeModal(modalProfessor);
    document.getElementById('cancelModalProf').onclick = () => closeModal(modalProfessor);


    async function carregarAlunos() {
        try {
            const res = await fetch(`${API_BASE_URL}/alunos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const alunos = await res.json();
            const tbody = document.getElementById('tabelaAlunos');
            tbody.innerHTML = '';

            if (alunos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Nenhum aluno encontrado.</td></tr>';
                return;
            }

            alunos.forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${a.matricula}</td>
                    <td>${a.nome}</td>
                    <td>${a.turma ? a.turma.nome : '-'}</td>
                    <td>${a.responsavel || '-'}</td>
                    <td>
                        <button class="btn-action btn-delete" onclick="deletarAluno('${a._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) { console.error(err); }
    }

    window.deletarAluno = async (id) => {
        if(!confirm('Remover aluno?')) return;
        await fetch(`${API_BASE_URL}/alunos/${id}`, { 
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
        });
        carregarAlunos();
    };

    document.getElementById('formAluno').onsubmit = async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.getElementById('nomeAluno').value,
            matricula: document.getElementById('matriculaAluno').value,
            turmaId: document.getElementById('turmaSelect').value,
            responsavel: document.getElementById('responsavelAluno').value
        };
        await fetch(`${API_BASE_URL}/alunos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });
        closeModal(modalAluno);
        carregarAlunos();
    };

    async function carregarTurmasSelect() {
        const res = await fetch(`${API_BASE_URL}/turmas`, { headers: { 'Authorization': `Bearer ${token}` } });
        const turmas = await res.json();
        const select = document.getElementById('turmaSelect');
        select.innerHTML = '<option value="">Selecione...</option>';
        turmas.forEach(t => {
            if (t.status === 'Ativa') {
                select.innerHTML += `<option value="${t._id}">${t.nome}</option>`;
            }
        });
    }

    async function carregarProfessores() {
        try {
            const res = await fetch(`${API_BASE_URL}/professores`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profs = await res.json();
            const tbody = document.getElementById('tabelaProfessores');
            tbody.innerHTML = '';

            profs.forEach(p => {
                const isCoord = p.cargo === 'coordenador';
                // Switch apenas se for admin
                const switchHtml = isAdmin ? `
                    <label class="toggle-switch">
                        <input type="checkbox" ${isCoord ? 'checked' : ''} onchange="mudarCargo('${p._id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                ` : (isCoord ? '<span class="status-badge status-justificada">Coord</span>' : 'Prof');

                const actionsHtml = isAdmin ? `
                    <button class="btn-action btn-delete" onclick="deletarProfessor('${p._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : '-';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.nome}</td>
                    <td>${p.email}</td>
                    <td>${p.disciplina || '-'}</td>
                    <td>${switchHtml}</td>
                    <td class="admin-only-col">${actionsHtml}</td>
                `;
                tbody.appendChild(tr);
            });

            if (!isAdmin) {
                document.querySelectorAll('.admin-only-col').forEach(el => el.style.display = 'none');
            }

        } catch (err) { console.error(err); }
    }

    window.deletarProfessor = async (id) => {
        if(!confirm('Tem certeza? Isso removerá o acesso do professor ao sistema.')) return;
        const res = await fetch(`${API_BASE_URL}/professores/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) carregarProfessores();
        else alert('Erro ao deletar');
    };

    window.mudarCargo = async (id, isCoord) => {
        const novoCargo = isCoord ? 'coordenador' : 'professor';
        await fetch(`${API_BASE_URL}/professores/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ cargo: novoCargo })
        });
        alert(`Cargo alterado para ${novoCargo}`);
    };

    document.getElementById('formProfessor').onsubmit = async (e) => {
        e.preventDefault();
        const dados = {
            nome: document.getElementById('nomeProf').value,
            email: document.getElementById('emailProf').value,
            telefone: document.getElementById('telProf').value,
            disciplina: document.getElementById('discProf').value,
            cargo: document.getElementById('cargoProf').value
        };

        const res = await fetch(`${API_BASE_URL}/professores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });
        
        const json = await res.json();
        if (res.ok) {
            alert('Professor cadastrado! Senha padrão: 123456');
            closeModal(modalProfessor);
            carregarProfessores();
        } else {
            alert(json.mensagem);
        }
    };

    window.deletarResponsavel = async (id) => {
        if (!confirm('Tem certeza que deseja remover este responsável?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/responsaveis/${id}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (res.ok) {
                alert('Responsável removido com sucesso!');
                carregarResponsaveis();
            } else {
                alert('Erro ao deletar responsável.');
            }
        } catch (err) {
            console.error('Erro na exclusão:', err);
        }
    };

    async function carregarResponsaveis() {
        const corpoTabela = document.getElementById('corpoTabelaListagemResponsaveis');
        corpoTabela.innerHTML = `<tr><td colspan="5">Carregando...</td></tr>`; 

        try {
            if (!token) {
                corpoTabela.innerHTML = `<tr><td colspan="5">Erro: Usuário não autenticado.</td></tr>`;
                return;
            }

            const response = await fetch(`${API_BASE_URL}/responsaveis`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Erro ao carregar a lista de responsáveis. Verifique o console ou se a rota está implementada no backend.');
            }

            const responsaveis = await response.json();
            
            corpoTabela.innerHTML = ''; 

            if (responsaveis.length === 0) {
                corpoTabela.innerHTML = `<tr><td colspan="5">Nenhum responsável cadastrado.</td></tr>`;
                return;
            }

            responsaveis.forEach(responsavel => {
                const tr = document.createElement('tr');
                
                const alunoVinculado = responsavel.aluno; 
                
                let alunoVinculadoTexto = 'N/A';
                
                if (alunoVinculado && alunoVinculado.nome && alunoVinculado.matricula) {
                    alunoVinculadoTexto = `${alunoVinculado.nome} (${alunoVinculado.matricula})`;
                } else if (alunoVinculado && alunoVinculado.matricula) {
                    alunoVinculadoTexto = alunoVinculado.matricula;
                } else if (responsavel.alunoMatricula) { 
                    alunoVinculadoTexto = responsavel.alunoMatricula;
                }


                tr.innerHTML = `
                    <td>${responsavel.nome}</td>
                    <td>${responsavel.email}</td>
                    <td>${responsavel.telefone || 'N/A'}</td>
                    <td>${alunoVinculadoTexto}</td> <td>
                        <button class="btn-action btn-delete" onclick="deletarResponsavel('${responsavel._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                corpoTabela.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao listar responsáveis:', error);
            corpoTabela.innerHTML = `<tr><td colspan="5">Falha ao carregar responsáveis: ${error.message}</td></tr>`;
        }
    }


    carregarAlunos();
    carregarTurmasSelect();
    carregarProfessores();
    atualizarBotoesHeader('tab-alunos');
});