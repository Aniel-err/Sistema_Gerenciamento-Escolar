// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // <-- ADICIONADO
const Usuario = require("../models/Usuario");

// 🔑 Chave secreta JWT (mova para .env depois)
const SECRET = "segredo123";

/* =======================================================
   🧩 CADASTRO DE USUÁRIO
======================================================= */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    // Verifica se já existe
    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ mensagem: "❌ Usuário já cadastrado!" });
    }

    // Salva usuário (hash será feito pelo pre-save do modelo)
    const novoUsuario = new Usuario({
      nome,
      email,
      senha, // senha em texto puro, será criptografada automaticamente
      tipo: tipo || "aluno",
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: "✅ Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "❌ Erro no servidor", erro: err });
  }
});

/* =======================================================
   🔐 LOGIN (gera token)
======================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Pede para o BD incluir a senha na busca (pois temos select: false no model)
    const usuario = await Usuario.findOne({ email }).select('+senha');
    if (!usuario)
      return res.status(404).json({ mensagem: "❌ Usuário não encontrado!" });

    // Usa o método do modelo para verificar senha
    const senhaCorreta = await usuario.verificarSenha(senha);
    if (!senhaCorreta)
      return res.status(401).json({ mensagem: "❌ Senha incorreta!" });

    const token = jwt.sign(
      {
        id: usuario._id,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
      SECRET,
      { expiresIn: "8h" } // Aumentei para 8h
    );
    
    // Remove a senha antes de enviar a resposta
    usuario.senha = undefined;

    res.json({
      mensagem: `✅ Bem-vindo(a), ${usuario.nome}!`,
      token,
      usuario // Envia dados do usuário (sem senha)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "❌ Erro no servidor", erro: err });
  }
});

/* =======================================================
   🛡 ROTA PROTEGIDA (VALIDA TOKEN) - (Já estava aí)
======================================================= */
router.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensagem: "❌ Token ausente!" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);

    res.json({
      mensagem: `✅ Token válido. Bem-vindo(a), ${decoded.nome}!`,
      tipo: decoded.tipo,
    });
  } catch (err) {
    res.status(401).json({ mensagem: "❌ Token inválido ou expirado!" });
  }
});


/* =======================================================
   🔑 ESQUECER SENHA (Envia "email") - (NOVO)
======================================================= */
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            // Não diga que o usuário não existe (por segurança)
            return res.status(200).json({ mensagem: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
        }

        // 1. Cria um token de reset aleatório
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // 2. Define um tempo de expiração (1 hora)
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora

        // 3. Salva o token e a expiração no usuário (conforme o Model)
        usuario.resetToken = resetToken;
        usuario.resetTokenExpiry = resetTokenExpiry;
        await usuario.save();

        // 4. SIMULAÇÃO DE ENVIO DE E-MAIL (mostra no console do backend)
        console.log('--- SIMULAÇÃO DE ENVIO DE E-MAIL ---');
        console.log(`Para: ${email}`);
        console.log(`Token de Reset: ${resetToken}`);
        console.log('Link: http://[SEU_IP_FRONTEND]/reset-password.html?token=' + resetToken);
        // (No futuro, você usaria uma lib como Nodemailer aqui)

        res.status(200).json({ mensagem: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao processar recuperação de senha.' });
    }
});


/* =======================================================
   🔑 RESETAR SENHA (Define nova senha) - (NOVO)
======================================================= */
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body; // Pega a nova senha do corpo da requisição

    if (!senha) {
         return res.status(400).json({ mensagem: 'Nova senha é obrigatória.' });
    }

    try {
        // 1. Procura o usuário pelo token E verifica se não expirou
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } // $gt = "maior que" agora
        });

        if (!usuario) {
            return res.status(400).json({ mensagem: 'Token inválido ou expirado.' });
        }

        // 2. Define a nova senha
        usuario.senha = senha;
        // 3. Limpa os campos de reset
        usuario.resetToken = undefined;
        usuario.resetTokenExpiry = undefined;
        
        await usuario.save(); // O 'pre save' no Model vai criptografar a nova senha

        res.status(200).json({ mensagem: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao redefinir a senha.' });
    }
});


module.exports = router;