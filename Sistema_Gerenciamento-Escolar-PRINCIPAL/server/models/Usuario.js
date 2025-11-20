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

    // 📸 NOVO CAMPO PARA A FOTO DE PERFIL
    foto: { type: String, default: null },

    /* ==================================================
       🔹 VERIFICAÇÃO DE EMAIL
    ================================================== */
    emailVerificado: { type: Boolean, default: false },
    tokenVerificacao: { type: String, default: null },

    /* ==================================================
       🔹 RECUPERAÇÃO DE SENHA
    ================================================== */
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null }
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
UsuarioSchema.methods.verificarSenha = async function (senhaDigitada) {
  // Se a senha não estiver carregada (select:false), busca do DB
  if (!this.senha) {
    const usuario = await this.constructor.findById(this._id).select('+senha');
    return bcrypt.compare(senhaDigitada, usuario.senha);
  }
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);