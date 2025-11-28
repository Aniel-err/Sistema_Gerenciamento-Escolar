document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    
    const modal = document.getElementById('modalEvento');
    const form = document.getElementById('formEvento');
    const containerEventos = document.getElementById('eventos');
    const modalTitle = document.getElementById('modalTitle');
    
    const btnNovo = document.getElementById('btnNovoEvento');
    const btnClose = document.getElementById('closeModal');
    const btnLimpar = document.getElementById('btnLimpar');

    const idInput = document.getElementById('idEvento');
    const tituloInput = document.getElementById('titulo');
    const descInput = document.getElementById('descricao');
    const inicioInput = document.getElementById('dataInicio');
    const fimInput = document.getElementById('dataFim');
    const localInput = document.getElementById('local');
    const turmasInput = document.getElementById('turmas');

    function openModal() { 
        modal.classList.add('show'); 
    }
    
    function closeModal() { 
        modal.classList.remove('show'); 
        form.reset();
        idInput.value = '';
        modalTitle.textContent = "Criar Evento";
    }

    if (btnNovo) btnNovo.onclick = openModal;
    if (btnClose) btnClose.onclick = closeModal;
    if (btnLimpar) btnLimpar.onclick = closeModal;

    async function carregarEventos() {
        try {
            const res = await fetch('http://localhost:3000/eventos', {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) throw new Error("Erro ao buscar eventos");
            
            const eventos = await res.json();
            renderizarEventos(eventos);

        } catch (err) { 
            console.error(err);
            containerEventos.innerHTML = '<p style="color:red; padding:20px;">Erro ao carregar eventos.</p>';
        }
    }

    function renderizarEventos(eventos) {
        containerEventos.innerHTML = '';

        if (eventos.length === 0) {
            containerEventos.innerHTML = '<p style="padding:20px; color:#666;">Nenhum evento agendado.</p>';
            return;
        }

        eventos.forEach(ev => {
            const dataFormatada = new Date(ev.dataInicio).toLocaleString('pt-BR', { 
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
            });

            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${ev.titulo}</h3>
                    
                    <div class="card-actions">
                        <button class="btn-icon edit" title="Editar">
                            <i class="fas fa-pen"></i>
                        </button>
                        
                        <button class="btn-icon delete" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <p style="font-size: 0.95em; color: #555; margin-bottom: 20px; line-height: 1.5;">
                    ${ev.descricao || 'Sem descrição disponível.'}
                </p>
                
                <div style="background: #f9f9f9; padding: 10px; border-radius: 8px;">
                    <ul class="alerts-list" style="padding: 0; list-style: none; margin: 0;">
                        <li style="margin-bottom: 8px; font-size: 0.9em;">
                            <i class="fas fa-clock text-primary"></i> 
                            <strong>Início:</strong> ${dataFormatada}
                        </li>
                        <li style="margin-bottom: 8px; font-size: 0.9em;">
                            <i class="fas fa-map-marker-alt text-danger"></i> 
                            <strong>Local:</strong> ${ev.local || 'Não definido'}
                        </li>
                        <li style="font-size: 0.9em;">
                            <i class="fas fa-users text-success"></i> 
                            <strong>Turmas:</strong> ${ev.turmas || 'Todas'}
                        </li>
                    </ul>
                </div>
            `;

            const btnEdit = card.querySelector('.btn-icon.edit');
            const btnDelete = card.querySelector('.btn-icon.delete');

            btnEdit.onclick = () => editarEvento(ev);
            btnDelete.onclick = () => deletarEvento(ev._id);

            containerEventos.appendChild(card);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = idInput.value;
        const dados = {
            titulo: tituloInput.value,
            descricao: descInput.value,
            dataInicio: inicioInput.value,
            dataFim: fimInput.value,
            local: localInput.value,
            turmas: turmasInput.value 
        };

        const url = id ? `http://localhost:3000/eventos/${id}` : 'http://localhost:3000/eventos';
        const method = id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dados)
            });

            if (res.ok) {
                alert("Evento salvo com sucesso!");
                closeModal();
                carregarEventos();
            } else {
                const erro = await res.json();
                alert(erro.mensagem || "Erro ao salvar.");
            }
        } catch (err) { 
            console.error(err);
            alert("Erro de conexão.");
        }
    });

    window.editarEvento = (ev) => {
        modalTitle.textContent = "Editar Evento";
        idInput.value = ev._id;
        tituloInput.value = ev.titulo;
        descInput.value = ev.descricao || "";
        localInput.value = ev.local || "";
        turmasInput.value = ev.turmas || "";

       
        if(ev.dataInicio) inicioInput.value = ev.dataInicio.slice(0, 16);
        if(ev.dataFim) fimInput.value = ev.dataFim.slice(0, 16);

        openModal();
    };

    window.deletarEvento = async (id) => {
        if(!confirm("Tem certeza que deseja apagar este evento?")) return;

        try {
            const res = await fetch(`http://localhost:3000/eventos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(res.ok) {
                carregarEventos();
            } else {
                alert("Erro ao excluir.");
            }
        } catch (err) { console.error(err); }
    };

    carregarEventos();
});