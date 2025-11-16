const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();
const SECRET = "CHAVE_SECRETA";

// LOGIN
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ erro: "Usuário não encontrado" });

  const validPassword = await bcrypt.compare(senha, user.senha);
  if (!validPassword) return res.status(401).json({ erro: "Senha inválida" });

  const token = jwt.sign({ id: user._id, tipo: user.tipo }, SECRET, { expiresIn: "1h" });

  res.json({ mensagem: "Login realizado com sucesso!", token });
});

// CADASTRO
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ erro: "Usuário já existe" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const newUser = new User({ nome, email, senha: hashedPassword });
    await newUser.save();

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    res.status(500).json({ erro: "Erro no servidor", detalhe: error });
  }
});

module.exports = router;
