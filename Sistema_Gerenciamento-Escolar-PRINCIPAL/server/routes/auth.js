const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
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

    // Salva usuário sem criptografar aqui (hash será feito pelo pre-save do modelo)
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

    const usuario = await Usuario.findOne({ email });
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
      { expiresIn: "1h" }
    );

    res.json({
      mensagem: `✅ Bem-vindo(a), ${usuario.nome}!`,
      token,
      tipo: usuario.tipo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensagem: "❌ Erro no servidor", erro: err });
  }
});

/* =======================================================
   🛡 ROTA PROTEGIDA (VALIDA TOKEN)
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

module.exports = router;
