const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    tipo: {
      type: String,
      enum: ['aluno', 'professor', 'coordenador', 'admin'],
      default: 'aluno'
    }
  },
  { versionKey: false }
);

// 🔐 Criptografa a senha automaticamente antes de salvar
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();

  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);

  next();
});

// 🔍 Método para comparar senha
UsuarioSchema.methods.verificarSenha = function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
