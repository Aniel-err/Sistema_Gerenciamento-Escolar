const express = require("express");
const router = express.Router();
const presencaController = require("../controllers/presencaController");
const authMiddleware = require("../middlewares/authMiddleware"); 


router.get(
    "/alunos", 
    authMiddleware, 
    presencaController.listarAlunosParaFrequencia
); 


router.post("/salvar", presencaController.salvar);
router.get("/listar", presencaController.listar);
router.get("/resumo", presencaController.resumo);

module.exports = router;