const mongoose = require('mongoose');

const ProfessorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: String,
  cargo: { 
    type: String, 
    enum: ['professor', 'coordenador'],
    required: true 
  },
  disciplina: String,
  

  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  }
  

}, { versionKey: false });

module.exports = mongoose.model('Professor', ProfessorSchema);