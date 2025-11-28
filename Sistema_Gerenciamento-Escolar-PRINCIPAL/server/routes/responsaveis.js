const express = require('express');
const router = express.Router();
const ResponsavelController = require('../controllers/ResponsavelController'); 

const verificarToken = require('../middlewares/authMiddleware'); 

const ehAdmin = (req, res, next) => {
    if (req.user && req.user.tipo === 'admin') {
        return next(); 
    }
    return res.status(403).json({ erro: "Acesso negado: Requer privilégios de administrador." });
};


router.post('/', verificarToken, ehAdmin, ResponsavelController.cadastrarResponsavel);


router.get('/', verificarToken, ResponsavelController.listarResponsaveis);


router.put('/:id', verificarToken, ehAdmin, ResponsavelController.atualizarResponsavel);


router.delete('/:id', verificarToken, ehAdmin, ResponsavelController.deletarResponsavel);


module.exports = router;