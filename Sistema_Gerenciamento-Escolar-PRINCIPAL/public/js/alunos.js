// public/js/alunos.js

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));
    const isAdmin = usuarioLogado && usuarioLogado.tipo === 'admin';

    // Container de Botões do Header
    const btnContainer = document.getElementById('btnContainer');

    // Elementos DOM
    const modalAluno = document.getElementById('modalAluno');
    const modalProfessor = document.getElementById('modalProfessor');
    
    // --- BOTÕES DE AÇÃO ---
    function atualizarBotoesHeader(abaAtiva) {
        btnContainer.innerHTML = ''; // Limpa

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
        }
    }

    // --- SISTEMA DE ABAS ---
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', () => {
            // Remove active
            document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Adiciona active
            link.classList.add('active');
            const tabId = link.dataset.tab;
            document.getElementById(tabId).classList.add('active');

            // Atualiza botão do topo
            atualizarBotoesHeader(tabId);
        });
    });

    // --- MODAIS ---
    function openModal(modal) { modal.classList.add('show'); }
    function closeModal(modal) { 
        modal.classList.remove('show'); 
        modal.querySelector('form').reset();
    }

    // Eventos de Fechar
    document.getElementById('closeModalAluno').onclick = () => closeModal(modalAluno);
    document.getElementById('cancelModalAluno').onclick = () => closeModal(modalAluno);
    document.getElementById('closeModalProf').onclick = () => closeModal(modalProfessor);
    document.getElementById('cancelModalProf').onclick = () => closeModal(modalProfessor);

    // ============================================================
    // 🎓 LÓGICA DE ALUNOS
    // ============================================================
    async function carregarAlunos() {
        try {
            const res = await fetch('http://localhost:3000/alunos', {
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
        await fetch(`http://localhost:3000/alunos/${id}`, { 
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
        await fetch('http://localhost:3000/alunos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dados)
        });
        closeModal(modalAluno);
        carregarAlunos();
    };

    // Carregar Turmas para o Select
    async function carregarTurmasSelect() {
        const res = await fetch('http://localhost:3000/turmas', { headers: { 'Authorization': `Bearer ${token}` } });
        const turmas = await res.json();
        const select = document.getElementById('turmaSelect');
        select.innerHTML = '<option value="">Selecione...</option>';
        turmas.forEach(t => {
            if (t.status === 'Ativa') {
                select.innerHTML += `<option value="${t._id}">${t.nome}</option>`;
            }
        });
    }

    // ============================================================
    // 👨‍🏫 LÓGICA DE PROFESSORES
    // ============================================================
    async function carregarProfessores() {
        try {
            const res = await fetch('http://localhost:3000/professores', {
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

            // Esconde colunas de admin se não for admin
            if (!isAdmin) {
                document.querySelectorAll('.admin-only-col').forEach(el => el.style.display = 'none');
            }

        } catch (err) { console.error(err); }
    }

    window.deletarProfessor = async (id) => {
        if(!confirm('Tem certeza? Isso removerá o acesso do professor ao sistema.')) return;
        const res = await fetch(`http://localhost:3000/professores/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) carregarProfessores();
        else alert('Erro ao deletar');
    };

    window.mudarCargo = async (id, isCoord) => {
        const novoCargo = isCoord ? 'coordenador' : 'professor';
        await fetch(`http://localhost:3000/professores/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ cargo: novoCargo })
        });
        // Não precisa recarregar tudo, o switch já mudou visualmente
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

        const res = await fetch('http://localhost:3000/professores', {
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


    // INICIALIZAÇÃO
    carregarAlunos();
    carregarTurmasSelect();
    carregarProfessores();
    atualizarBotoesHeader('tab-alunos'); // Começa na aba alunos
});