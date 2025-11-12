const mongoose = require('mongoose');

const AlunoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  matricula: { type: String, required: true, unique: true },
  turma: { type: mongoose.Schema.Types.ObjectId, ref: 'Turma' },
  responsavel: String
}, { versionKey: false });

module.exports = mongoose.model('Aluno', AlunoSchema);
