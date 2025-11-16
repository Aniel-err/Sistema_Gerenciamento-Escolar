// server/models/Usuario.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    senha: { type: String, required: true, select: false }, // 'select: false' é uma boa prática
    tipo: {
      type: String,
      enum: ['aluno', 'professor', 'coordenador', 'admin'],
      default: 'aluno'
    },
    
    // --- ADICIONADO PARA O "ESQUECER SENHA" ---
    resetToken: String,
    resetTokenExpiry: Date
    // ----------------------------------------
    
  },
  { 
    versionKey: false,
    timestamps: true // Adiciona 'createdAt' e 'updatedAt'
  }
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
  // 'select: false' exige que a senha seja selecionada manualmente antes de comparar
  // Mas no login/controller, você vai buscar o usuário com .select('+senha')
  return bcrypt.compare(senhaDigitada, this.senha);
};

module.exports = mongoose.model('Usuario', UsuarioSchema);