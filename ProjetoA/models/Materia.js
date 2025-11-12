const mongoose = require("mongoose");

const MateriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  professor: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Materia", MateriaSchema);
