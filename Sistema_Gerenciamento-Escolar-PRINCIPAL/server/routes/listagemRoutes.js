// server/routes/listagemRoutes.js
const express = require("express");
const router = express.Router();

const Aluno = require("../models/Aluno");
const Professor = require("../models/Professor");

// LISTAR ALUNOS
router.get("/alunos", async (req, res) => {
  try {
    const alunos = await Aluno.find();
    res.json(alunos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar alunos" });
  }
});

// LISTAR PROFESSORES
router.get("/professores", async (req, res) => {
  try {
    const profs = await Professor.find();
    res.json(profs);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar professores" });
  }
});

module.exports = router;
