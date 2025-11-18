// public/js/cadastro-turmas.js (CORRIGIDO)

document.addEventListener('DOMContentLoaded', function() {
    
    const token = localStorage.getItem('token');
    
    // Elementos do Modal
    const modalOverlay = document.getElementById('turma-modal-overlay');
    const modalTitle = document.querySelector('#turma-modal-overlay h2');
    const openModalButton = document.getElementById('open-turma-modal-button');
    const closeModalButton = document.getElementById('close-turma-modal-button');
    const cancelModalButton = document.getElementById('cancel-turma-modal-button');
    const turmaForm = document.getElementById('turma-form');
    const professorSelect = document.getElementById('professor-regente');

    // Elementos da Tabela e Abas
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabelaAtivas = document.querySelector('#tab-ativas tbody');
    const tabelaInativas = document.querySelector('#tab-inativas tbody');

    // Variáveis de controle para Edição
    let editMode = false;
    let editTurmaId = null;

    // Função para tratar token inválido/ausente
    function redirectToLogin(message) {
        alert(message || 'Sessão expirada. Faça login novamente.');
        localStorage.clear();
        window.location.href = 'login.html';
    }

    // --- LÓGICA DAS ABAS (Tabs) ---
    tabLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // --- LÓGICA DO MODAL (Abrir/Fechar) ---
    function openModal() {
        if (modalOverlay) modalOverlay.classList.add('show');
    }
    
    function closeModal() {
        if (modalOverlay) modalOverlay.classList.remove('show');
        
        turmaForm.reset();
        modalTitle.textContent = "Nova Turma";
        editMode = false;
        editTurmaId = null;
    }

    if (openModalButton) {
        openModalButton.addEventListener('click', () => {
            modalTitle.textContent = "Nova Turma";
            editMode = false;
            editTurmaId = null;
            turmaForm.reset();
            openModal();
        });
    }

    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if (cancelModalButton) cancelModalButton.addEventListener('click', closeModal);
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) closeModal();
        });
    }

    // --- CARREGAR DADOS DO BACKEND (READ) ---
    async function carregarTurmas() {
        if (!token) {
             redirectToLogin('Você não está logado.');
             return;
        }

        try {
            const response = await fetch('http://localhost:3000/turmas', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.status === 401) { // Trata token expirado/inválido
                 redirectToLogin('Sessão expirada. Faça login novamente.');
                 return;
            }
            
            if (!response.ok) { 
                const erro = await response.json();
                throw new Error(erro.mensagem || 'Erro ao buscar turmas.');
            }
            
            const turmas = await response.json();
            renderizarTabelas(turmas);
        } catch (error) { 
            console.error('Erro:', error);
            alert(error.message);
        }
    }

    // --- CARREGAR PROFESSORES NO DROPDOWN ---
    async function carregarProfessores() {
        if (!token) return; 
        try {
            const response = await fetch('http://localhost:3000/professores', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 401) return; // Se falhar, a tela principal vai tratar o erro

            if (!response.ok) throw new Error('Erro ao carregar professores');
            const professores = await response.json();
            
            // Adiciona a opção "Nenhum" (importante para limpar o professor regente)
            professorSelect.innerHTML = '<option value="">Nenhum Professor</option>';
            professores.forEach(prof => {
                const option = document.createElement('option');
                option.value = prof._id;
                option.textContent = prof.nome;
                professorSelect.appendChild(option);
            });
        } catch (error) { 
            console.error('Erro ao carregar professores:', error);
        }
    }

    // --- RENDERIZAR TABELAS (Preencher com dados) ---
    function renderizarTabelas(turmas) {
        tabelaAtivas.innerHTML = '';
        tabelaInativas.innerHTML = '';
        let contagemAtivas = 0;
        let contagemInativas = 0;

        turmas.forEach(turma => {
            // Pega o nome do primeiro professor (Regente) se existir
            const nomeProfessor = turma.professores && turma.professores.length > 0 
                                  ? turma.professores[0].nome 
                                  : 'Nenhum';
            
            const linhaHtml = `
                <tr>
                    <td>${turma.nome}</td>
                    <td>${turma.serie || turma.anoLetivo}</td>
                    <td>${turma.periodo}</td>
                    <td>${turma.alunos ? turma.alunos.length : 0}</td> 
                    <td>${nomeProfessor}</td>
                    <td>
                        <button class="btn-action btn-edit" data-id="${turma._id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-action btn-delete" data-id="${turma._id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;

            if (turma.status === 'Ativa') {
                tabelaAtivas.innerHTML += linhaHtml;
                contagemAtivas++;
            } else {
                 const linhaInativaHtml = `
                    <tr>
                        <td>${turma.nome}</td>
                        <td>${turma.serie || turma.anoLetivo}</td>
                        <td>${turma.periodo}</td>
                        <td>${turma.anoLetivo}</td>
                        <td><button class="btn-action btn-view" data-id="${turma._id}"><i class="fas fa-eye"></i></button></td>
                    </tr>
                `;
                tabelaInativas.innerHTML += linhaInativaHtml;
                contagemInativas++;
            }
        });
        
        // Atualiza a contagem das abas
        document.querySelector('.tab-link[data-tab="tab-ativas"]').textContent = `Turmas Ativas (${contagemAtivas})`;
        document.querySelector('.tab-link[data-tab="tab-inativas"]').textContent = `Turmas Inativas (${contagemInativas})`;
    }

    // --- SALVAR (CREATE ou UPDATE) ---
    if (turmaForm) {
        turmaForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const dadosTurma = {
                nome: document.getElementById('nome-turma').value,
                // Usando o ano atual como default (se o campo não existir no HTML)
                anoLetivo: new Date().getFullYear().toString(), 
                serie: document.getElementById('serie-ano').value,
                periodo: document.getElementById('turno').value,
                // Envia null se "Nenhum Professor" for selecionado
                professorRegenteId: professorSelect.value || null 
            };

            const url = editMode 
                ? `http://localhost:3000/turmas/${editTurmaId}`
                : 'http://localhost:3000/turmas';
            
            const method = editMode ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dadosTurma)
                });

                const data = await response.json();
                
                if (response.status === 401) {
                    redirectToLogin('Sessão expirada. Faça login novamente.');
                    return;
                }
                if (!response.ok) throw new Error(data.mensagem);

                alert(data.mensagem);
                closeModal();
                carregarTurmas(); // Recarrega a tabela

            } catch (error) {
                console.error('Erro:', error);
                alert(error.message);
            }
        });
    }

    // --- Event Listener da Tabela (Delete e Edit) ---
    tabelaAtivas.addEventListener('click', async function(event) {
        
        // --- Lógica de DELETAR ---
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            const turmaId = deleteButton.getAttribute('data-id');
            if (confirm('Tem certeza que deseja excluir esta turma?')) {
                try {
                    const response = await fetch(`http://localhost:3000/turmas/${turmaId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    
                    if (response.status === 401) {
                         redirectToLogin('Sessão expirada. Faça login novamente.');
                         return;
                    }
                    if (!response.ok) throw new Error(data.mensagem);
                    
                    alert(data.mensagem);
                    carregarTurmas();
                } catch (error) {
                    console.error('Erro:', error);
                    alert(error.message);
                }
            }
        }

        // --- Lógica de EDITAR ---
        const editButton = event.target.closest('.btn-edit');
        if (editButton) {
            const turmaId = editButton.getAttribute('data-id');
            
            try {
                // 1. Busca os dados da turma no backend
                const response = await fetch(`http://localhost:3000/turmas/${turmaId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) {
                    redirectToLogin('Sessão expirada. Faça login novamente.');
                    return;
                }
                if (!response.ok) throw new Error('Erro ao buscar dados da turma.');
                
                const turma = await response.json();

                // 2. Preenche o modal
                document.getElementById('nome-turma').value = turma.nome;
                document.getElementById('serie-ano').value = turma.serie;
                document.getElementById('turno').value = turma.periodo;
                // Preenche o professor regente, usando o ID do primeiro professor ou string vazia
                document.getElementById('professor-regente').value = turma.professores.length > 0 ? turma.professores[0] : ""; 
                
                // 3. Configura o modo de edição e abre o modal
                modalTitle.textContent = "Editar Turma";
                editMode = true;
                editTurmaId = turma._id;
                openModal();

            } catch (error) {
                console.error('Erro:', error);
                alert(error.message);
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    carregarTurmas(); 
    carregarProfessores();
});