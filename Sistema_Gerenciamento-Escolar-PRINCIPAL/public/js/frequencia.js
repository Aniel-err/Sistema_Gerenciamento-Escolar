document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os elementos do Modal
    const modalOverlay = document.getElementById('frequency-modal-overlay');
    const openModalButton = document.getElementById('open-modal-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const cancelModalButton = document.getElementById('cancel-modal-button');
    const frequencyForm = document.getElementById('frequency-form');

    // Função para abrir o modal
    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('show');
        }
    }

    // Função para fechar o modal
    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    }

    // Event Listeners para abrir e fechar
    if (openModalButton) {
        openModalButton.addEventListener('click', openModal);
    }
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }
    if (cancelModalButton) {
        cancelModalButton.addEventListener('click', closeModal);
    }

    // Fechar o modal ao clicar no overlay (fundo)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Lógica de envio do formulário do modal (Simulação)
    if (frequencyForm) {
        frequencyForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio real do formulário
            
            // Aqui você pegaria os dados e enviaria para o backend
            const aluno = document.getElementById('aluno-select').value;
            const data = document.getElementById('data-registro').value;
            const status = document.querySelector('input[name="status"]:checked').value;
            
            console.log('Registro Salvo (Simulação):', { aluno, data, status });
            
            alert('Frequência registrada com sucesso! (Simulação)');
            closeModal(); // Fecha o modal após o sucesso
            frequencyForm.reset(); // Limpa o formulário
        });
    }
    
    // Configura a data padrão para hoje nos filtros e no modal
    const today = new Date().toISOString().split('T')[0];
    const filterDate = document.getElementById('filter-date');
    const dataRegistro = document.getElementById('data-registro');
    if (filterDate) filterDate.value = today;
    if (dataRegistro) dataRegistro.value = today;
});