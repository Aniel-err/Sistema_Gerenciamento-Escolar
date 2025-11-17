// server/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },

    senha: { type: String, required: true, select: false },

    tipo: {
      type: String,
      enum: ['aluno', 'professor', 'coordenador', 'admin'],
      default: 'aluno'
    },

    /* ==================================================
       🔹 CAMPOS DE VERIFICAÇÃO DE EMAIL
    ================================================== */
    emailVerificado: {
      type: Boolean,
      default: false
    },

    tokenVerificacao: {
      type: String,
      default: null
    },

    /* ==================================================
       🔹 CAMPOS DE RESETAR SENHA (já existiam)
    ================================================== */
    resetToken: String,
    resetTokenExpiry: Date
  },
  { 
    versionKey: false,
    timestamps: true
  }
);

/* ==================================================
   🔐 Criptografa a senha antes de salvar
================================================== */
UsuarioSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();

  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);

  next();
});

/* ==================================================
   🔍 Método para verificar senha
================================================== */
UsuarioSchema.methods.verificarSenha = function (senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
