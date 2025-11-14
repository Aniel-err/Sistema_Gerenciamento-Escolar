const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: String,
  cargo: { 
    type: String, 
    enum: ['professor', 'coordenador'], // define o tipo
    required: true 
  },
  disciplina: String,
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma' }
}, { versionKey: false });

module.exports = mongoose.model('Professor', ProfessorSchema);
