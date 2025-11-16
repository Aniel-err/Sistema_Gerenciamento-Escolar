// public/js/login.js

document.addEventListener('DOMContentLoaded', function() {
    
    // MUDADO DE 'login-form' PARA 'formLogin' PARA BATER COM SEU HTML
    const loginForm = document.getElementById('formLogin'); 
    
    const messageContainer = document.getElementById('message-container');
    const email = document.getElementById('email');
    
    // Seu HTML tem o id="senha", então ajustamos aqui também
    const password = document.getElementById('senha'); 

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        messageContainer.innerHTML = '';

        const emailValue = email.value;
        const passValue = password.value;
        
        // --- CONEXÃO COM O BACKEND ---
        try {
            // 1. Chama a rota /auth/login
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailValue,
                    senha: passValue // O backend espera 'senha'
                })
            });

            const data = await response.json();

            if (response.ok) {
                // SUCESSO!
                showMessage(data.mensagem, 'success');
                
                // 2. Salva o token e os dados do usuário no navegador
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                // 3. Redireciona para o dashboard após 1 segundo
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);

            } else {
                // ERRO (Ex: "Senha incorreta!")
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