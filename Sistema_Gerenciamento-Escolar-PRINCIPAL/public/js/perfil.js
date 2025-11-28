document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario'));

    const form = document.getElementById('profileForm');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const cargoInput = document.getElementById('cargo');
    const senhaInput = document.getElementById('senha');
    const confirmaInput = document.getElementById('confirmaSenha');
    const fotoInput = document.getElementById('fotoInput');
    const previewAvatar = document.getElementById('previewAvatar');

    if (usuarioLogado) {
        nomeInput.value = usuarioLogado.nome;
        emailInput.value = usuarioLogado.email;
        cargoInput.value = usuarioLogado.tipo.toUpperCase();
        
        atualizarPreviewFoto(usuarioLogado);
    }

    fotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewAvatar.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            }
            reader.readAsDataURL(file);
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (senhaInput.value && senhaInput.value !== confirmaInput.value) {
            alert("As senhas não coincidem!");
            return;
        }

        const formData = new FormData();
        formData.append('nome', nomeInput.value);
        
        if (senhaInput.value) {
            formData.append('senha', senhaInput.value);
        }

        if (fotoInput.files[0]) {
            formData.append('foto', fotoInput.files[0]);
        }

        try {
            const response = await fetch('http://localhost:3000/auth/update', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                 
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert("Perfil atualizado com sucesso!");
                
                localStorage.setItem('usuario', JSON.stringify(data.usuario));

                window.location.reload();
            } else {
                alert(data.mensagem || "Erro ao atualizar.");
            }

        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    });

    function atualizarPreviewFoto(usuario) {
        if (usuario.foto) {
           
            const fotoUrl = 'http://localhost:3000/' + usuario.foto;
            previewAvatar.innerHTML = `<img src="${fotoUrl}" alt="Foto Perfil">`;
            
            const navAvatar = document.getElementById('profile-button');
            if(navAvatar) {
                navAvatar.style.backgroundImage = `url('${fotoUrl}')`;
                navAvatar.style.backgroundSize = 'cover';
                navAvatar.textContent = ''; 
            }
        } else {
            previewAvatar.textContent = usuario.nome.charAt(0).toUpperCase();
        }
    }
});