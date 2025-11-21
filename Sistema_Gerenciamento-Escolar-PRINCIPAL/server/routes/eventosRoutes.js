const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const controller = require("../controllers/eventosController");

// TODAS AS ROTAS PRECISAM DE TOKEN
router.use(auth);

router.post("/", controller.criarEvento);
router.get("/", controller.listarEventos);
router.get("/:id", controller.buscarEvento);
router.put("/:id", controller.atualizarEvento);
router.delete("/:id", controller.deletarEvento);

module.exports = router;
