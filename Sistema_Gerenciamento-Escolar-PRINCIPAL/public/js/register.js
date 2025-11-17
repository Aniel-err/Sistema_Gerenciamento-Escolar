document.addEventListener('DOMContentLoaded', function() {
    
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const nome = document.getElementById('fullname');
    const email = document.getElementById('email');

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        messageContainer.innerHTML = '';

        // --- VALIDAÇÕES ---
        if (password.value !== confirmPassword.value) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        if (password.value.length < 6) {
            showMessage('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }

        // --- ENVIO PARA O BACKEND ---
        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nome.value,
                    email: email.value,
                    senha: password.value
                })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCESSO - USUÁRIO CRIADO E E-MAIL DE VERIFICAÇÃO FOI ENVIADO
                showMessage(
                    "Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.",
                    'success'
                );

                registerForm.reset();
            } else {
                // ERRO DO SERVIDOR (ex: "Email já cadastrado")
                showMessage(data.mensagem, 'error');
            }

        } catch (error) {
            console.error('Erro de rede:', error);
            showMessage('Não foi possível conectar ao servidor.', 'error');
        }
    });

    // Função para exibir mensagens
    function showMessage(messageText, messageType) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + messageType;
        messageElement.textContent = messageText;
        messageContainer.appendChild(messageElement);
    }
});
