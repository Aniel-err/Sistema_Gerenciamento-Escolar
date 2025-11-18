const express = require("express");
const router = express.Router();
const presencaController = require("../controllers/presencaController");

// rotas corretas
router.post("/salvar", presencaController.salvar);
router.get("/listar", presencaController.listar);
router.get("/resumo", presencaController.resumo);

module.exports = router;
