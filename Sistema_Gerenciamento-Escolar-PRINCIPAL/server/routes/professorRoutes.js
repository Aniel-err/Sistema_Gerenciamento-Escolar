// server/routes/professorRoutes.js

const express = require('express');
const router = express.Router();
const professorController = require('../controllers/professorController');
const auth = require('../middlewares/auth'); // Pega seu middleware de autenticação

// Proteger todas as rotas (só logado pode ver)
router.use(auth);

// Rota para Listar todos os Professores (GET /professores)
// (Usamos /professores para seguir seu padrão de /turmas, /materias)
router.get('/', professorController.getProfessores);

module.exports = router;