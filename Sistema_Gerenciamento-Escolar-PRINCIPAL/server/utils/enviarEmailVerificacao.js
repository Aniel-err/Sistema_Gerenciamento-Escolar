// server/utils/enviarEmailVerificacao.js
const nodemailer = require("nodemailer");

async function enviarEmailVerificacao(email, token) {
  try {
    // 1️⃣ Configuração do transportador Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "projetoe81@gmail.com",   // seu e-mail Gmail
        pass: "skve roue bgne zhql"        // senha de app gerada no Gmail
      }
    });

    // 2️⃣ Link de verificação
    const link = `http://localhost:3000/auth/verify/${token}`;

    // 3️⃣ Envia o e-mail
    const info = await transporter.sendMail({
      from: "Sistema Escolar <projetoe81@gmail.com>", // deve ser o mesmo do auth
      to: email,
      subject: "Verifique seu e-mail",
      html: `
        <h2>Confirme seu e-mail</h2>
        <p>Clique no link abaixo para ativar sua conta:</p>
        <a href="${link}" style="color: blue; font-size: 18px;">
          ${link}
        </a>
        <br><br>
        <p>Se você não criou uma conta, ignore este e-mail.</p>
      `
    });

    console.log(`✔ Email de verificação enviado! MessageId: ${info.messageId}`);
  } catch (err) {
    console.error("❌ Erro ao enviar email:", err.response || err);
  }
}

module.exports = enviarEmailVerificacao;
