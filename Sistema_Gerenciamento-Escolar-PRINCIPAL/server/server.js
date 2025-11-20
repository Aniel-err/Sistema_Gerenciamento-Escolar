require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./config/Database");

// ==========================================
// 1. IMPORTAÇÃO DAS ROTAS
// ==========================================
const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
const professorRoutes = require("./routes/professorRoutes");
const presencaRoutes = require("./routes/presencaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const listagemRoutes = require("./routes/listagemRoutes"); // rota de listagem

// ==========================================
// APP CONFIG
// ==========================================
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Conecta ao MongoDB
connect();

// ==========================================
// 2. ROTAS PRINCIPAIS
// ==========================================
app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);
app.use("/turmas", turmaRoutes);
app.use("/professores", professorRoutes);
app.use("/alunos", alunoRoutes);

// Rotas com prefixo /api
app.use("/api/presencas", presencaRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ==========================================
// 3. ROTA DE LISTAGEM
// ==========================================
app.use("/listagem", listagemRoutes); // já funciona para alunos e professores

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 API Unificada rodando na porta ${PORT}`);
});
