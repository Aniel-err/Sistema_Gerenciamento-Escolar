const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  // Pega somente o token (remove o "Bearer ")
  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, "segredo123"); // <-- MESMA CHAVE DO LOGIN
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

module.exports = auth;
