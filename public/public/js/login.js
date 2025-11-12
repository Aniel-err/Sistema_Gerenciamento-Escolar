document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('login-form');
    const messageContainer = document.getElementById('message-container');
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    loginForm.addEventListener('submit', function(event) {
        
        // 1. Previne o envio padrão do formulário
        event.preventDefault();

        // 2. Limpa mensagens antigas
        messageContainer.innerHTML = '';

        // 3. Pega os valores
        const emailValue = email.value;
        const passValue = password.value;

        // 4. Lógica de Validação (SIMULAÇÃO)
        // (Aqui você chamaria uma API real)
        if (emailValue === 'admin@exemplo.com' && passValue === '123456') {
            // Se o login for válido
            showMessage('Login efetuado com sucesso!', 'success');
            
            // (Opcional) Limpa o formulário
            loginForm.reset();

            // (Opcional) Redireciona para uma página de "logado"
            // setTimeout(() => {
            //     window.location.href = '/dashboard.html';
            // }, 1000);

        } else {
            // Se o login for inválido
            showMessage('Email ou senha inválidos.', 'error');
        }
    });

    // Função auxiliar para criar e exibir a mensagem
    function showMessage(messageText, messageType) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + messageType;
        messageElement.textContent = messageText;
        messageContainer.appendChild(messageElement);
    }
});