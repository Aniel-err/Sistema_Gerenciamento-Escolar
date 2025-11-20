// public/js/global.js

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. VERIFICAÇÃO DE SEGURANÇA E DADOS DO USUÁRIO
    const token = localStorage.getItem('token');
    const usuarioJson = localStorage.getItem('usuario');

    if (!token || !usuarioJson) {
        // Se não tiver token, manda pro login (exceto se já estiver no login/registro)
        const path = window.location.pathname;
        if (!path.includes('login.html') && !path.includes('register.html') && !path.includes('reset-password')) {
            window.location.href = 'login.html';
        }
        return;
    }

    const usuario = JSON.parse(usuarioJson);

    // 2. PREENCHER DADOS NO MENU (NAVBAR)
    const navNome = document.getElementById('nav-user-name');
    const navEmail = document.getElementById('nav-user-email');
    const navCargo = document.getElementById('nav-user-role');
    const navAvatar = document.getElementById('profile-button'); // O círculo no topo

    if (navNome) navNome.textContent = usuario.nome;
    if (navEmail) navEmail.textContent = usuario.email;
    if (navCargo) navCargo.textContent = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1);

    // --- LÓGICA DA FOTO DE PERFIL ---
    if (navAvatar) {
        if (usuario.foto) {
            // Se tiver foto, monta a URL e coloca como background
            const fotoUrl = `http://localhost:3000/${usuario.foto}`;
            
            navAvatar.style.backgroundImage = `url('${fotoUrl}')`;
            navAvatar.style.backgroundSize = 'cover';
            navAvatar.style.backgroundPosition = 'center';
            navAvatar.style.color = 'transparent'; // Esconde a letra
            navAvatar.textContent = ''; // Remove a letra para garantir
        } else {
            // Se não tiver foto, mostra a inicial
            navAvatar.style.backgroundImage = 'none';
            navAvatar.style.color = '#ffffff';
            navAvatar.textContent = usuario.nome.charAt(0).toUpperCase();
        }
    }
    // --------------------------------

    // 3. LÓGICA DO DROPDOWN (PERFIL E NOTIFICAÇÕES)
    const profileButton = document.getElementById('profile-button');
    const profileDropdown = document.getElementById('profile-dropdown');
    const notificationButton = document.getElementById('notification-button');
    const notificationDropdown = document.getElementById('notification-dropdown');

    // Toggle Perfil
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
            if(notificationDropdown) notificationDropdown.classList.remove('show');
        });
    }

    // Toggle Notificações
    if (notificationButton && notificationDropdown) {
        notificationButton.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
            if(profileDropdown) profileDropdown.classList.remove('show');
        });
    }

    // Fechar ao clicar fora
    window.addEventListener('click', function(e) {
        if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileButton) {
            profileDropdown.classList.remove('show');
        }
        if (notificationDropdown && !notificationDropdown.contains(e.target) && e.target !== notificationButton) {
            notificationDropdown.classList.remove('show');
        }
    });

    // 4. LÓGICA DE SAIR (LOGOUT)
    const btnSair = document.getElementById('btn-logout');
    if (btnSair) {
        btnSair.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
});