const express = require("express");
const auth = require("../middlewares/auth");
const Materia = require("../models/Materia");

const router = express.Router();

// Apenas coordenador pode adicionar
router.post("/", auth, (req, res) => {
  if (req.user.tipo !== "coordenador") {
    return res.status(403).json({ erro: "Apenas coordenador pode adicionar matérias" });
  }

  const materia = new Materia(req.body);
  materia.save()
    .then(() => res.json({ mensagem: "Matéria adicionada com sucesso" }))
    .catch(err => res.status(400).json({ erro: err.message }));
});

module.exports = router;
