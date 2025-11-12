const express = require("express");
const authRoutes = require("./routes/authRoutes");
const materiasRoutes = require("./routes/materiasRoutes");
const connect = require("./Database");

const app = express();
app.use(express.json());

connect(); // <--- conecta ao MongoDB

app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);

app.listen(3000, () => console.log("API rodando na porta 3000"));
