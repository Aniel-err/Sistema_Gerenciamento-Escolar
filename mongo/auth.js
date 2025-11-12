const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');

// Conexão com o MongoDB Atlas
const uri = "mongodb+srv://lucaslviana07_db_user:jumento123@cluster0.zmpci15.mongodb.net/escola?appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('❌ Erro ao conectar:', err));

// Função pra cadastrar novo usuário (com senha criptografada)
async function cadastrar(nome, email, senha, tipo = 'aluno') {
  const novoUsuario = new Usuario({ nome, email, senha, tipo });
  await novoUsuario.save();
  console.log('✅ Usuário cadastrado com sucesso!');
}

// Função de login (gera token JWT)
async function login(email, senha) {
  const usuario = await Usuario.findOne({ email });
  if (!usuario) return console.log('❌ Usuário não encontrado!');

  const senhaCorreta = await usuario.verificarSenha(senha);
  if (!senhaCorreta) return console.log('❌ Senha incorreta!');

  const token = jwt.sign(
    { id: usuario._id, nome: usuario.nome, tipo: usuario.tipo },
    'segredo123', // chave secreta (depois pode ir no .env)
    { expiresIn: '1h' } // token expira em 1 hora
  );

  console.log('✅ Login bem-sucedido!');
  console.log('🔑 Token JWT:', token);
}

// Exemplo: primeiro cadastra e depois faz login
(async () => {
  await cadastrar('Lucas Viana', 'lucas@email.com', '123456', 'professor');
  await login('lucas@email.com', '123456');
  process.exit();
})();
