const mongoose = require('mongoose');

const TurmaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  anoLetivo: { type: String, required: true },
  periodo: String,
  professores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
  alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Aluno' }]
}, { versionKey: false });

module.exports = mongoose.model('Turma', TurmaSchema);
