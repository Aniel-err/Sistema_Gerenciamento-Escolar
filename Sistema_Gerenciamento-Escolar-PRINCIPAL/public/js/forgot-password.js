document.addEventListener('DOMContentLoaded', function() {
    
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const messageContainer = document.getElementById('message-container');
    const emailInput = document.getElementById('email');

    forgotPasswordForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        messageContainer.innerHTML = ''; 

        const emailValue = emailInput.value;

        if (!emailValue || !emailValue.includes('@')) {
             showMessage('Por favor, insira um e-mail válido.', 'error');
             return;
        }

        try {
            const response = await fetch('http://localhost:3000/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailValue })
            });
            
            const data = await response.json();

           
            showMessage(data.mensagem, 'success');
            forgotPasswordForm.reset();

        } catch (error) {
            console.error('Erro de rede:', error);
            showMessage('Erro ao conectar com o servidor. Tente mais tarde.', 'error');
        }
    });

    function showMessage(messageText, messageType) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + messageType;
        messageElement.textContent = messageText;
        messageContainer.appendChild(messageElement);
    }
});