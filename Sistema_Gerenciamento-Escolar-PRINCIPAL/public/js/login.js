document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('formLogin'); 
    const messageContainer = document.getElementById('message-container');
    const email = document.getElementById('email');
    const password = document.getElementById('senha'); 

    // Modal elementos
    const modal = document.getElementById('modal-verificacao');
    const closeModal = document.getElementById('close-modal');
    const btnResend = document.getElementById('btn-resend');
    const resendMessage = document.getElementById('resend-message');

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        messageContainer.innerHTML = '';

        const emailValue = email.value.trim();
        const passValue = password.value.trim();
        
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailValue,
                    senha: passValue
                })
            });

            const data = await response.json();

            /* ===========================================================
               🔥 SE O EMAIL NÃO ESTÁ VERIFICADO → ABRE A MODAL
            ============================================================ */
            if (response.status === 401 && data.mensagem.includes("Email não verificado")) {
                modal.style.display = 'flex';
                return;
            }

            /* ===========================================================
               🔥 LOGIN OK
            ============================================================ */
            if (response.ok) {
                showMessage(data.mensagem, 'success');

                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);

                return;
            }

            /* ===========================================================
               ❌ OUTROS ERROS DE LOGIN
            ============================================================ */
            showMessage(data.mensagem, 'error');


        } catch (error) {
            console.error('Erro de rede:', error);
            showMessage('Erro ao conectar com o servidor. Tente mais tarde.', 'error');
        }
    });

    // Fechar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        resendMessage.innerHTML = '';
    });

    // Clicar fora da modal fecha
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            resendMessage.innerHTML = '';
        }
    });

    // Reenviar link de verificação
    btnResend.addEventListener('click', async () => {
        resendMessage.innerHTML = '';
        try {
            const response = await fetch('http://localhost:3000/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.value })
            });
            const data = await response.json();

            if (response.ok) {
                resendMessage.textContent = "✅ Link reenviado! Verifique sua caixa de entrada.";
                resendMessage.style.color = "green";
            } else {
                resendMessage.textContent = data.mensagem || "❌ Não foi possível reenviar.";
                resendMessage.style.color = "red";
            }
        } catch (error) {
            console.error(error);
            resendMessage.textContent = "❌ Erro ao tentar reenviar o link.";
            resendMessage.style.color = "red";
        }
    });

    function showMessage(messageText, messageType) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message ' + messageType;
        messageElement.textContent = messageText;
        messageContainer.appendChild(messageElement);
    }
});
