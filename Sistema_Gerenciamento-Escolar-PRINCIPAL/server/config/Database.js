const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function connect() {
  if (!MONGO_URI) {
    console.error("❌ Variável MONGO_URI não definida no .env! A conexão falhará.");
    return;
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