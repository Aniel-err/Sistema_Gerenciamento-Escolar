// server/routes/turmaRoutes.js (CORRIGIDO)

const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const auth = require('../middlewares/authMiddleware'); // 🚨 CORREÇÃO: Nome do arquivo

router.use(auth); // Proteger todas as rotas com o middleware

// Função auxiliar para verificar se é Admin ou Coordenador (para rotas POST/PUT/DELETE)
const isAdminOrCoordenador = (req, res, next) => {
    if (req.user.tipo !== 'admin' && req.user.tipo !== 'coordenador') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin ou Coordenador.' });
    }
    next();
};

// Rota para Criar Turma (POST /turmas)
router.post('/', isAdminOrCoordenador, turmaController.createTurma);

// Rota para Listar todas as Turmas (GET /turmas)
router.get('/', turmaController.getTurmas);

// Rota para Buscar UMA Turma (GET /turmas/:id)
router.get('/:id', turmaController.getTurmaById);

// Rota para Atualizar Turma (PUT /turmas/:id)
router.put('/:id', isAdminOrCoordenador, turmaController.updateTurma);

// Rota para Deletar Turma (DELETE /turmas/:id)
router.delete('/:id', isAdminOrCoordenador, turmaController.deleteTurma);

module.exports = router;