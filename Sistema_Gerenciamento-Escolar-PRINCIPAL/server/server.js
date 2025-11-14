const express = require("express");
const cors = require("cors");
const connect = require("./config/Database");

const authRoutes = require("./routes/auth");
const materiasRoutes = require("./routes/materiasRoutes");

const app = express();

app.use(express.json());
app.use(cors()); // <-- 🔥 OBRIGATÓRIO PARA FUNCIONAR O FRONT

connect();

app.get("/", (req, res) => {
  res.send("🔥 API Unificada rodando na porta 3000");
});

app.use("/auth", authRoutes);
app.use("/materias", materiasRoutes);

app.listen(3000, () => {
  console.log("🔥 API Unificada rodando na porta 3000");
});
