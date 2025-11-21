// server/utils/enviarEmailVerificacao.js
const nodemailer = require("nodemailer");

// Lendo variáveis do .env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function enviarEmailVerificacao(email, token) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("⚠️ EMAIL_USER ou EMAIL_PASS ausentes no .env!");
      return { success: false, error: "Env vars ausentes" };
    }

    // Configuração do transportador Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    // Link dinâmico para verificação
    const link = `${FRONTEND_URL}/auth/verify/${token}`;
    console.log("🔗 Link de verificação gerado:", link);

    await transporter.sendMail({
      from: `Sistema Escolar <${EMAIL_USER}>`,
      to: email,
      subject: "Verifique seu e-mail",
      html: `
        <h2>Confirme seu e-mail</h2>
        <p>Clique no link abaixo para ativar sua conta:</p>
        <a href="${link}" style="color: blue; font-size: 18px;">${link}</a>
        <p>Se você não solicitou este e-mail, ignore-o.</p>
      `
    });

    return { success: true };

  } catch (err) {
    console.error("❌ Erro ao enviar e-mail de verificação:", err);
    return { success: false, error: err.message };
  }
}

module.exports = enviarEmailVerificacao;
