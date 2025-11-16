// server/server.js

const express = require("express");
const cors = require("cors");
const connect = require("./config/Database");

const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
// 1. IMPORTA A NOVA ROTA
const professorRoutes = require("./routes/professorRoutes"); 

const app = express();

app.use(express.json());
app.use(cors());

connect();

// ... (app.get '/') ...

app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);
app.use("/turmas", turmaRoutes);
// 2. USA A NOVA ROTA
app.use("/professores", professorRoutes); 

app.listen(3000, () => {
  console.log("🔥 API Unificada rodando na porta 3000");
});