const form = document.getElementById("formLogin");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await resposta.json();

    if (resposta.ok) {
      alert("✅ " + data.mensagem);
      localStorage.setItem("token", data.token);
      window.location.href = "home.html"; 
    } else {
      alert("❌ " + (data.erro || "Falha no login"));
    }
  } catch (erro) {
    alert("⚠️ Erro de conexão com o servidor.");
  }
});
