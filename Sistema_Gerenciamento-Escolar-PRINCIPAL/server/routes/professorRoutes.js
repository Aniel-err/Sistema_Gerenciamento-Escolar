// server/routes/professorRoutes.js
const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); // Protege todas as rotas (precisa estar logado)

// Middleware local para verificar se é ADMIN
const isAdmin = (req, res, next) => {
    if (req.user.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin.' });
    }
    next();
};

// GET - Listar (Qualquer logado pode ver a lista para selecionar em turmas)
router.get('/', professorController.getProfessores);

// POST - Criar (Apenas Admin)
router.post('/', isAdmin, professorController.createProfessor);

// PUT - Atualizar/Promover (Apenas Admin)
router.put('/:id', isAdmin, professorController.updateProfessor);

// DELETE - Remover (Apenas Admin)
router.delete('/:id', isAdmin, professorController.deleteProfessor);

module.exports = router;