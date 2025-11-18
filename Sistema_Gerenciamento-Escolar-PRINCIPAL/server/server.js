const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./config/Database");

// Rotas
const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
const professorRoutes = require("./routes/professorRoutes");
const presencaRoutes = require("./routes/presencaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));

connect();

app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);
app.use("/turmas", turmaRoutes);
app.use("/professores", professorRoutes);

app.use("/api/presencas", presencaRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(3000, () => {
  console.log("🔥 API Unificada rodando na porta 3000");
});
