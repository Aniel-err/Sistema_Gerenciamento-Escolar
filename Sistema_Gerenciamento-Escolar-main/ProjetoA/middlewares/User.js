const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  tipo: {
    type: String,
    enum: ["estudante", "diretor", "coordenador"],
    required: true
  }
});

module.exports = mongoose.model("User", UserSchema);
