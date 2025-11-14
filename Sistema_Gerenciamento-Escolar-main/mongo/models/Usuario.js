const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo: { type: String, enum: ['aluno', 'professor', 'coordenador', 'admin'], default: 'aluno' }
}, { versionKey: false });

// Criptografa a senha antes de salvar no banco
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método pra comparar senha
UsuarioSchema.methods.verificarSenha = async function (senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
