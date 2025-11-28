const express = require('express');
const router = express.Router();
const turmaController = require('../controllers/turmaController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

const isAdminOrCoordenador = (req, res, next) => {
    if (req.user.tipo !== 'admin' && req.user.tipo !== 'coordenador') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin ou Coordenador.' });
    }
    next();
};

router.post('/', isAdminOrCoordenador, turmaController.createTurma);

router.get('/', turmaController.getTurmas);

router.get('/:id', turmaController.getTurmaById);

router.put('/:id', isAdminOrCoordenador, turmaController.updateTurma);

router.delete('/:id', isAdminOrCoordenador, turmaController.deleteTurma);

module.exports = router;