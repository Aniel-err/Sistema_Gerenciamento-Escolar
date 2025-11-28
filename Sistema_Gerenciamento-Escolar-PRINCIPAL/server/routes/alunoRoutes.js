const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const auth = require('../middlewares/authMiddleware');

router.use(auth); 

router.post('/', alunoController.create);
router.get('/', alunoController.getAll);
router.delete('/:id', alunoController.delete);

module.exports = router;