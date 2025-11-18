const nodemailer = require("nodemailer");

async function enviarEmailVerificacao(email, token) {
  try {
    // 1️⃣ Configuração do transportador Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "projetoe81@gmail.com",   // seu e-mail Gmail
        pass: "skve roue bgne zhql"        // use senha de app gerada no Gmail
      }
    });

    // Verifica se o transporter está OK
    await transporter.verify();
    console.log("✅ Transporter verificado com sucesso.");

    // 2️⃣ Link de verificação
    const link = `http://localhost:3000/auth/verify/${token}`;
    console.log(`🔗 Link de verificação gerado: ${link}`);

    // 3️⃣ Envia o e-mail
    const info = await transporter.sendMail({
      from: "Sistema Escolar <projetoe81@gmail.com>",
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
    console.error("❌ Erro ao enviar email de verificação:", err);
  }
}

module.exports = enviarEmailVerificacao;
