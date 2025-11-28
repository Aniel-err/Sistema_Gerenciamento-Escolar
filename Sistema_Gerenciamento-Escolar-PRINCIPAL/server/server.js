require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./config/Database");


const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");
const turmaRoutes = require("./routes/turmaRoutes");
const professorRoutes = require("./routes/professorRoutes");
const presencaRoutes = require("./routes/presencaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const alunoRoutes = require("./routes/alunoRoutes");
const listagemRoutes = require("./routes/listagemRoutes");
const responsaveisRoutes = require("./routes/responsaveis"); 
const eventosRoutes = require("./routes/eventosRoutes");


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));

app.use('/uploads', express.static(path.join(__dirname, "uploads")));

connect();


app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);
app.use("/turmas", turmaRoutes);
app.use("/professores", professorRoutes);
app.use("/alunos", alunoRoutes);
app.use("/eventos", eventosRoutes);
app.use("/responsaveis", responsaveisRoutes);

app.use("/api/presencas", presencaRoutes); 
app.use("/api/dashboard", dashboardRoutes);


app.use("/listagem", listagemRoutes); 


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔥 API Unificada rodando na porta ${PORT}`);
});