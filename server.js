const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');

const app = express();
app.use(express.json());

// Conectar ao MongoDB Atlas
const uri = "mongodb+srv://lucaslviana07_db_user:jumento123@cluster0.zmpci15.mongodb.net/escola?appName=Cluster0";
mongoose.connect(uri)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => console.error('❌ Erro ao conectar:', err));

// Middleware para validar token JWT
function autenticarToken(req, res, next) {
  const token = req.headers['authorization']; // o token vem no header: Authorization: Bearer <token>
  if (!token) return res.status(401).json({ erro: 'Token não fornecido!' });

  // remove o prefixo "Bearer " se tiver
  const tokenLimpo = token.split(' ')[1];

  jwt.verify(tokenLimpo, 'segredo123', (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido ou expirado!' });
    req.usuario = usuario; // guarda os dados do usuário no request
    next();
  });
}

// Rota pública (teste)
app.get('/', (req, res) => {
  res.send('🌐 API Online!');
});

// Rota protegida
app.get('/dashboard', autenticarToken, (req, res) => {
  res.json({
    mensagem: `Bem-vindo(a), ${req.usuario.nome}!`,
    tipo: req.usuario.tipo,
    id: req.usuario.id
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
