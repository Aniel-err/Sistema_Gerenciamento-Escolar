// server/models/Turma.js
const mongoose = require('mongoose');

const TurmaSchema = new mongoose.Schema({
  nome: { type: String, required: true }, // Ex: "9º Ano A"
  anoLetivo: { type: String, required: true }, // Ex: "2025"
  periodo: String, // Ex: "Manhã"
  professores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
  alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Aluno' }],

  // --- ADICIONADO PARA AS ABAS "ATIVAS/INATIVAS" ---
  status: {
    type: String,
    enum: ['Ativa', 'Inativa'],
    default: 'Ativa'
  }
  // ---------------------------------------------
  
}, { versionKey: false });

module.exports = mongoose.model('Turma', TurmaSchema);