// Espera o documento carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona os elementos do formulário
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');

    // Adiciona um "escutador" para o evento de 'submit' (envio)
    registerForm.addEventListener('submit', function(event) {
        
        // 1. Previne que o formulário seja enviado e a página recarregue
        event.preventDefault();

        // 2. Limpa qualquer mensagem antiga
        messageContainer.innerHTML = '';

        // 3. Pega os valores da senha e da confirmação
        const passValue = password.value;
        const confirmPassValue = confirmPassword.value;

        // 4. Lógica de Validação
        if (passValue !== confirmPassValue) {
            // Se as senhas NÃO forem iguais
            showMessage('As senhas não coincidem. Tente novamente.', 'error');
        } else if (passValue.length < 8) {
            // Se a senha for muito curta
            showMessage('A senha deve ter no mínimo 8 caracteres.', 'error');
        } else {
            // Se tudo estiver certo (SUCESSO)
            showMessage('Registrado com sucesso!', 'success');
            
            // (Opcional) Limpa o formulário após o registro
            registerForm.reset();
        }
    });

    // Função auxiliar para criar e exibir a mensagem
    function showMessage(messageText, messageType) {
        // Cria um novo elemento <div>
        const messageElement = document.createElement('div');
        
        // Adiciona as classes CSS (ex: "message success" ou "message error")
        messageElement.className = 'message ' + messageType;
        
        // Define o texto da mensagem
        messageElement.textContent = messageText;

        // Adiciona o elemento de mensagem dentro do 'messageContainer'
        messageContainer.appendChild(messageElement);
    }
});