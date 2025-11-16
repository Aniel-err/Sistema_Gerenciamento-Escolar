document.addEventListener('DOMContentLoaded', function() {
    
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const nome = document.getElementById('fullname'); // Pegando o nome
    const email = document.getElementById('email'); // Pegando o email

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        messageContainer.innerHTML = '';

        // Validação básica do frontend
        if (password.value !== confirmPassword.value) {
            showMessage('As senhas não coincidem. Tente novamente.', 'error');
            return;
        }
        if (password.value.length < 6) { // (Opcional)
            showMessage('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        // --- CONEXÃO COM O BACKEND ---
        try {
            // 1. Chama a rota /auth/register
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome.value,
                    email: email.value,
                    senha: password.value
                    // O 'tipo' (role) será 'aluno' por padrão, como definido no backend
                })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCESSO!
                showMessage(data.mensagem + ' Você já pode fazer o login.', 'success');
                registerForm.reset();
            } else {
                // ERRO (Ex: "Usuário já cadastrado")
                showMessage(data.mensagem, 'error');
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            showMessage('Erro ao conectar com o servidor. Tente mais tarde.', 'error');
        }
        // -----------------------------
    });

    // Função auxiliar para exibir a mensagem
    function showMessage(messageText, messageType) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + messageType;
        messageElement.textContent = messageText;
        messageContainer.appendChild(messageElement);
    }
});