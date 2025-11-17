// server/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./config/Database");

const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
const professorRoutes = require("./routes/professorRoutes");

const app = express();

// Permite receber JSON no corpo das requisições
app.use(express.json());

// Permite receber dados de formulários HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Permite requisições de outros domínios
app.use(cors());

// TORNA A PASTA /public ACESSÍVEL
app.use(express.static(path.join(__dirname, "../public")));

// Conecta no banco
connect();

// Rotas da API
app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);
app.use("/turmas", turmaRoutes);
app.use("/professores", professorRoutes);

// Inicia servidor
app.listen(3000, () => {
  console.log("🔥 API Unificada rodando na porta 3000");
});
