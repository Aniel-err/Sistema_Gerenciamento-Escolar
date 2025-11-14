const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, "SENHA_SECRETA");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido" });
  }
}

module.exports = auth;
