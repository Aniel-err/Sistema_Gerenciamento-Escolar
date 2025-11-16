// server/routes/turmaRoutes.js

const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const auth = require('../middlewares/auth');

router.use(auth); // Proteger todas as rotas

// Rota para Criar Turma (POST /turmas)
router.post('/', (req, res, next) => {
    if (req.user.tipo !== 'admin' && req.user.tipo !== 'coordenador') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin ou Coordenador.' });
    }
    next();
}, turmaController.createTurma);

// Rota para Listar todas as Turmas (GET /turmas)
router.get('/', turmaController.getTurmas);

// --- **NOVO** Rota para Buscar UMA Turma (GET /turmas/:id) ---
// (Precisa vir ANTES de rotas com nomes, se houver)
router.get('/:id', turmaController.getTurmaById);

// Rota para Atualizar Turma (PUT /turmas/:id)
router.put('/:id', (req, res, next) => {
    if (req.user.tipo !== 'admin' && req.user.tipo !== 'coordenador') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin ou Coordenador.' });
    }
    next();
}, turmaController.updateTurma);

// Rota para Deletar Turma (DELETE /turmas/:id)
router.delete('/:id', (req, res, next) => {
    if (req.user.tipo !== 'admin' && req.user.tipo !== 'coordenador') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin ou Coordenador.' });
    }
    next();
}, turmaController.deleteTurma);

module.exports = router;