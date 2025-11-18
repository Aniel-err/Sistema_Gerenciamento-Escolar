// server/utils/enviarEmailRecuperacao.js
const nodemailer = require("nodemailer");

// 🚨 CORREÇÃO: Usando credenciais do arquivo .env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
// Converte a string 'true' para booleano, ou assume false se não estiver definido
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'; 

async function enviarEmailRecuperacao(email, link) {
  if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("⚠️ Credenciais de email não configuradas no .env. Email de recuperação NÃO ENVIADO.");
      return;
  }
  
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    const remetente = `Sistema Escolar <${EMAIL_USER}>`; 

    const mailOptions = {
      from: remetente,
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
  }
}

module.exports = enviarEmailRecuperacao;