const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const SECRET = "CHAVE_SECRETA";

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  const user = await User.findOne({ email, senha });
  if (!user) return res.status(401).json({ erro: "Login inválido" });

  const token = jwt.sign({ id: user._id, tipo: user.tipo }, SECRET, { expiresIn: "1h" });

  res.json({ mensagem: "Login realizado", token });
});

module.exports = router;
