const form = document.getElementById("formLogin");
const messageContainer = document.getElementById("message-container");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Limpa mensagens anteriores
  messageContainer.textContent = "";
  messageContainer.style.color = "";

 const email = document.getElementById("email").value.trim();
const senha = document.getElementById("senha").value.trim();


  try {
    const resposta = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await resposta.json();
    console.log(resposta.status, data); // 🔍 DEBUG

    if (resposta.ok) {
      // Mensagem de sucesso
      messageContainer.style.color = "green";
      messageContainer.textContent = data.mensagem;

      // Armazena token e redireciona
      localStorage.setItem("token", data.token);
      setTimeout(() => {
        window.location.href = "home.html";
      }, 1000); // espera 1s para o usuário ler a mensagem
    } else {
      // Mensagem de erro
      messageContainer.style.color = "red";
      messageContainer.textContent = data.mensagem || "Falha no login";
    }
  } catch (erro) {
    messageContainer.style.color = "red";
    messageContainer.textContent = "Erro de conexão com o servidor.";
    console.error(erro);

    console.log("Senha digitada:", senha);
console.log("Hash do banco:", usuario.senha);

  }
});
