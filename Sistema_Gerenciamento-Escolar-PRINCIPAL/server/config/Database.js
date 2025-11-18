// server/config/Database.js
const mongoose = require("mongoose");

// 🚨 CORREÇÃO: Usando a URI do arquivo .env
const MONGO_URI = process.env.MONGO_URI;

async function connect() {
  if (!MONGO_URI) {
    console.error("❌ Variável MONGO_URI não definida no .env! A conexão falhará.");
    return; // Para o fluxo se a URI não estiver definida
  }
  
  try {
    await mongoose.connect(MONGO_URI); 
    console.log("✅ Conectado ao MongoDB Atlas!");
  } catch (error) {
    console.log("❌ Erro ao conectar ao MongoDB Atlas");
    console.log(error.message);
  }
}

module.exports = connect;