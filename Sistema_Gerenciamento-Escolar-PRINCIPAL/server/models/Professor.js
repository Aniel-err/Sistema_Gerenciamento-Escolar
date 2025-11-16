// server/models/Professor.js
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
  
  // --- ADICIONADO PARA LIGAR AO LOGIN ---
  // Assim, quando um 'professor' logar, saberemos que é este perfil
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true
  }
  // -----------------------------------
  
  // 'turma' foi removido daqui. É melhor gerenciado pelo model 'Turma'.

}, { versionKey: false });

module.exports = mongoose.model('Professor', ProfessorSchema);