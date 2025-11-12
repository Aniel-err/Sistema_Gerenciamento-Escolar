const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/sistema-escola");
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.log("❌ Erro ao conectar ao MongoDB");
    console.log(error);
  }
}

module.exports = connect;
