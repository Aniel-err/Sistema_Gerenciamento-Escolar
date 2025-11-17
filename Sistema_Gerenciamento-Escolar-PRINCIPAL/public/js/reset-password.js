document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reset-form");
    const msg = document.getElementById("message");

    // pega token da URL
    const urlParams = window.location.pathname.split("/");
    const token = urlParams[urlParams.length - 1];

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const novaSenha = document.getElementById("novaSenha").value;

        const response = await fetch(`http://localhost:3000/auth/reset-password/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ novaSenha })
        });

        const data = await response.json();

        msg.innerHTML = data.mensagem;

        if (response.ok) {
            msg.style.color = "green";
        } else {
            msg.style.color = "red";
        }
    });
});
