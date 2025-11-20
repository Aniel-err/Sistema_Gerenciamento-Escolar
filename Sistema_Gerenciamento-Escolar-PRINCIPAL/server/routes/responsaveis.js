// Arquivo: server/routes/responsaveis.js (Refatorado para MVC)

const express = require('express');
const router = express.Router();
// 🛑 CORREÇÃO: Importa o Controlador, que contém a lógica do banco de dados
const ResponsavelController = require('../controllers/ResponsavelController'); 

// 🛑 IMPORTAÇÃO DO MIDDLEWARE 🛑
const verificarToken = require('../middlewares/authMiddleware'); 

// 🛑 FUNÇÃO ehAdmin 🛑
const ehAdmin = (req, res, next) => {
    // O middleware verificarToken já deve ter anexado as informações do usuário em req.user
    if (req.user && req.user.tipo === 'admin') {
        return next(); // Usuário é admin, prossegue
    }
    // Caso contrário, nega o acesso
    return res.status(403).json({ erro: "Acesso negado: Requer privilégios de administrador." });
};

// =========================================================
// 1. Rota POST: Criar Novo Responsável
// O trabalho de buscar o aluno e salvar é delegado ao Controller.
// =========================================================
router.post('/', verificarToken, ehAdmin, ResponsavelController.cadastrarResponsavel);

// =========================================================
// 2. Rota GET: Listar Todos os Responsáveis
// O trabalho de fazer o Responsavel.find().populate() é delegado ao Controller.
// =========================================================
router.get('/', verificarToken, ResponsavelController.listarResponsaveis);

// =========================================================
// 3. Rota PUT: Atualizar Responsável (Requer Admin)
// =========================================================
router.put('/:id', verificarToken, ehAdmin, ResponsavelController.atualizarResponsavel);

// =========================================================
// 4. Rota DELETE: Excluir Responsável (Requer Admin)
// =========================================================
router.delete('/:id', verificarToken, ehAdmin, ResponsavelController.deletarResponsavel);


module.exports = router;