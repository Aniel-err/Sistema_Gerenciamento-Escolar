const form = document.getElementById("register-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("fullname").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;
  const confirmar = document.getElementById("confirm-password").value;

  if (senha !== confirmar) {
    alert("❌ As senhas não coincidem!");
    return;
  }

  try {
    const resposta = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await resposta.json();

    if (resposta.ok) {
      alert("✅ Usuário cadastrado com sucesso!");
      window.location.href = "login.html";
    } else {
      alert("❌ " + (data.erro || "Erro ao cadastrar usuário"));
    }

  } catch (erro) {
    alert("⚠️ Erro ao conectar com o servidor.");
    console.error(erro);
  }
});
