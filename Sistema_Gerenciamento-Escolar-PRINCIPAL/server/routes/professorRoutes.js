const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

const isAdmin = (req, res, next) => {
    if (req.user.tipo !== 'admin') {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas Admin.' });
    }
    next();
};

router.get('/', professorController.getProfessores);

router.post('/', isAdmin, professorController.createProfessor);

router.put('/:id', isAdmin, professorController.updateProfessor);

router.delete('/:id', isAdmin, professorController.deleteProfessor);

module.exports = router;