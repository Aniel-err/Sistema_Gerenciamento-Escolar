const form = document.getElementById("register-form");
const messageContainer = document.getElementById("message-container");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpa mensagens anteriores
  messageContainer.textContent = "";
  messageContainer.style.color = "";

  const nome = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;
  const confirmar = document.getElementById("confirm-password").value;

  if (senha !== confirmar) {
    messageContainer.style.color = "red";
    messageContainer.textContent = "❌ As senhas não coincidem!";
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await resposta.json();
    console.log(resposta.status, data); // 🔍 DEBUG

    if (resposta.ok) {
      messageContainer.style.color = "green";
      messageContainer.textContent = "✅ Usuário cadastrado com sucesso!";
      
      // Redireciona para login após 1s
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } else {
      messageContainer.style.color = "red";
      messageContainer.textContent = data.mensagem || "❌ Erro ao cadastrar usuário";
    }
  } catch (erro) {
    messageContainer.style.color = "red";
    messageContainer.textContent = "⚠️ Erro ao conectar com o servidor.";
    console.error(erro);
  }
});
