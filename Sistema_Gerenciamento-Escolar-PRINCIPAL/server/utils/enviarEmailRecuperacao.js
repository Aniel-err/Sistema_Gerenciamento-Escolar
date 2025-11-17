// server/utils/enviarEmailRecuperacao.js
const nodemailer = require("nodemailer");

async function enviarEmailRecuperacao(email, link) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "projetoe81@gmail.com",
        pass: "skve roue bgne zhql"  // ❗ SENHA DE APP, NÃO A SENHA NORMAL DO GMAIL
      }
    });

    const mailOptions = {
      from: "Sistema Escolar <projetoe81@gmail.com>",
      to: email,
      subject: "🔑 Recuperação de senha",
      html: `
        <h2>Redefinição de senha</h2>
        <p>Clique no link abaixo para definir uma nova senha:</p>
        <a href="${link}" target="_blank">${link}</a>
        <br /><br />
        <p>O link expira em <b>1 hora</b>.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email de recuperação enviado para: ${email}`);

  } catch (error) {
    console.error("Erro ao enviar e-mail de recuperação:", error);
    throw error;
  }
}

module.exports = enviarEmailRecuperacao;
