const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect("mongodb+srv://lucaslviana07_db_user:jumento123@cluster0.zmpci15.mongodb.net/escola?appName=Cluster0");
    console.log("✅ Conectado ao MongoDB Atlas (banco do Lucas)");
  } catch (error) {
    console.log("❌ Erro ao conectar ao MongoDB Atlas");
    console.log(error);
  }
}

module.exports = connect;
