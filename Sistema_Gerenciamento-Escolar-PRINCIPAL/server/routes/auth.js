const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Usuario = require("../models/Usuario");
const enviarEmailVerificacao = require("../utils/enviarEmailVerificacao");

const SECRET = "segredo123";

/* =======================================================
   🧩 CADASTRO + ENVIO DE VERIFICAÇÃO DE EMAIL
======================================================= */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ mensagem: "❌ E-mail já cadastrado!" });
    }

    const tokenVerificacao = crypto.randomBytes(32).toString("hex");

    const novoUsuario = new Usuario({
      nome,
      email,
      senha, // criptografado pelo schema
      tipo: tipo || "aluno",
      emailVerificado: false,
      tokenVerificacao
    });

    await novoUsuario.save();

    await enviarEmailVerificacao(email, tokenVerificacao);

    return res.status(201).json({
      mensagem: "✅ Conta criada! Verifique seu e-mail para ativar sua conta."
    });
  } catch (err) {
    console.error("Erro /register:", err);
    return res.status(500).json({ mensagem: "❌ Erro ao criar usuário." });
  }
});

/* =======================================================
   🔗 VERIFICAÇÃO DE EMAIL
======================================================= */
router.get("/verify/:token", async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ tokenVerificacao: req.params.token });

    if (!usuario) {
      return res.status(400).send("❌ Token inválido ou usuário não encontrado.");
    }

    usuario.emailVerificado = true;
    usuario.tokenVerificacao = null;
    await usuario.save();

    return res.send("✅ E-mail verificado com sucesso! Agora você pode fazer login.");
  } catch (err) {
    console.error("Erro /verify:", err);
    return res.status(500).send("❌ Erro no servidor.");
  }
});

/* =======================================================
   🔁 REENVIAR LINK DE VERIFICAÇÃO
======================================================= */
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensagem: "❌ Usuário não encontrado!" });
    }

    if (usuario.emailVerificado) {
      return res.status(400).json({ mensagem: "✅ E-mail já verificado." });
    }

    usuario.tokenVerificacao = crypto.randomBytes(32).toString("hex");
    await usuario.save();

    await enviarEmailVerificacao(email, usuario.tokenVerificacao);

    return res.status(200).json({ mensagem: "✔ Link de verificação reenviado!" });
  } catch (err) {
    console.error("Erro /resend-verification:", err);
    return res.status(500).json({ mensagem: "❌ Erro ao reenviar o link." });
  }
});

/* =======================================================
   🔐 LOGIN COM VERIFICAÇÃO
======================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email }).select("+senha");

    if (!usuario) {
      return res.status(400).json({ error: "❌ Usuário não encontrado!" });
    }

    if (!usuario.emailVerificado) {
      return res.status(401).json({
        emailNaoVerificado: true,
        mensagem: "📩 Verifique seu e-mail antes de fazer login!"
      });
    }

    const senhaCorreta = await usuario.verificarSenha(senha);
    if (!senhaCorreta) {
      return res.status(400).json({ error: "❌ Senha incorreta!" });
    }

    const token = jwt.sign(
      { userId: usuario._id, nome: usuario.nome, tipo: usuario.tipo },
      SECRET,
      { expiresIn: "8h" }
    );

    usuario.senha = undefined;

    return res.json({
      mensagem: "✅ Login realizado!",
      token,
      usuario
    });
  } catch (err) {
    console.error("Erro /login:", err);
    return res.status(500).json({ error: "❌ Erro no login." });
  }
});

module.exports = router;
