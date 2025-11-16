const express = require("express");
const auth = require("../middlewares/auth");
const Materia = require("../models/Materia");

const router = express.Router();

/**
 * Criar disciplina
 * Apenas COORDENADOR pode criar
 */
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador") {
      return res.status(403).json({ erro: "Apenas coordenador pode adicionar matérias" });
    }

    const materia = new Materia(req.body);
    await materia.save();

    res.json({ mensagem: "Matéria adicionada com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

/**
 * Listar disciplinas
 */
router.get("/", auth, async (req, res) => {
  try {
    const materias = await Materia.find();
    res.json(materias);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar matérias" });
  }
});

/**
 * Atualizar uma disciplina
 * Apenas COORDENADOR pode editar
 */
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador") {
      return res.status(403).json({ erro: "Apenas coordenador pode editar matérias" });
    }

    await Materia.findByIdAndUpdate(req.params.id, req.body);
    res.json({ mensagem: "Matéria atualizada com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: "Erro ao atualizar matéria" });
  }
});

/**
 * Deletar disciplina
 * Apenas COORDENADOR pode deletar
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador") {
      return res.status(403).json({ erro: "Apenas coordenador pode excluir matérias" });
    }

    await Materia.findByIdAndDelete(req.params.id);
    res.json({ mensagem: "Matéria deletada com sucesso" });
  } catch (err) {
    res.status(400).json({ erro: "Erro ao deletar matéria" });
  }
});

module.exports = router;
