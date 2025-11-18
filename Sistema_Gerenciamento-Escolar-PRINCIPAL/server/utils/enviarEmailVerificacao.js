// server/utils/enviarEmailVerificacao.js
const nodemailer = require("nodemailer");

// 🚨 CORREÇÃO: Usando credenciais do arquivo .env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'; 

async function enviarEmailVerificacao(email, token) {
  if (!EMAIL_USER || !EMAIL_PASS) {
      console.warn("⚠️ Credenciais de email não configuradas no .env. Email de verificação NÃO ENVIADO.");
      return;
  }
    
  try {
    // 1️⃣ Configuração do transportador
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_SECURE,
      auth: {
        user: EMAIL_USER,   
        pass: EMAIL_PASS        
      }
    });

    // 2️⃣ Link de verificação
    const link = `http://localhost:3000/auth/verify/${token}`;
    console.log(`🔗 Link de verificação gerado: ${link}`);

    // 3️⃣ Envia o e-mail
    const remetente = `Sistema Escolar <${EMAIL_USER}>`;
    
    const info = await transporter.sendMail({
      from: remetente,
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

    console.log("Mensagem enviada: %s", info.messageId);

    return { success: true };

  } catch (error) {
    console.error("Erro ao enviar e-mail de verificação:", error);
    return { success: false, error: error.message };
  }
}

module.exports = enviarEmailVerificacao;