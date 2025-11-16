// server/models/Materia.js
const mongoose = require("mongoose");

const MateriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  // --- MODIFICADO PARA USAR REFERÊNCIA ---
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor', // Agora "linka" com o model Professor
    required: true
  }
  // ------------------------------------
});

module.exports = mongoose.model("Materia", MateriaSchema);