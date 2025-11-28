const express = require("express");
const auth = require("../middlewares/authMiddleware");
const Materia = require("../models/Materia");

const router = express.Router();


router.post("/", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador" && req.user.tipo !== "admin") {
      return res.status(403).json({ erro: "Apenas coordenador ou admin pode adicionar matérias" });
    }

    const materia = new Materia(req.body);
    await materia.save();

    res.json({ mensagem: "Matéria adicionada com sucesso", materia });
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: err.message });
  }
});


router.get("/", auth, async (req, res) => {
  try {
    const materias = await Materia.find().populate('professor', 'nome'); 
    res.json(materias);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar matérias" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador" && req.user.tipo !== "admin") {
      return res.status(403).json({ erro: "Apenas coordenador ou admin pode editar matérias" });
    }

    const materiaAtualizada = await Materia.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!materiaAtualizada) {
        return res.status(404).json({ erro: "Matéria não encontrada." });
    }

    res.json({ mensagem: "Matéria atualizada com sucesso", materia: materiaAtualizada });
  } catch (err) {
    console.error(err);
    res.status(400).json({ erro: "Erro ao atualizar matéria" });
  }
});


router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.tipo !== "coordenador" && req.user.tipo !== "admin") {
      return res.status(403).json({ erro: "Apenas coordenador ou admin pode deletar matérias" });
    }

    const materiaDeletada = await Materia.findByIdAndDelete(req.params.id);
    
    if (!materiaDeletada) {
        return res.status(404).json({ erro: "Matéria não encontrada." });
    }
    
    res.json({ mensagem: "Matéria excluída com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar matéria" });
  }
});


module.exports = router;