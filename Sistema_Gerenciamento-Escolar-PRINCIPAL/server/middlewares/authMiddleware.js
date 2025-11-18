// server/middlewares/authMiddleware.js (CÓDIGO NOVO - Substitui o antigo auth.js)
const jwt = require("jsonwebtoken");

// 🚨 CORREÇÃO: Usando a chave secreta do arquivo .env
const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    if (!SECRET) {
        console.error("JWT_SECRET não está definido! O middleware de autenticação não funcionará.");
        return res.status(500).json({ erro: "Configuração de segurança incompleta no servidor." });
    }
    
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token de autenticação não fornecido" });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ erro: "Formato de token inválido (esperado: Bearer <token>)" });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, SECRET); 
        
        // Adiciona as informações decodificadas do usuário na requisição (id e tipo)
        req.user = decoded; 
        
        return next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ erro: "Token expirado. Faça login novamente." });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ erro: "Token inválido." });
        }
        console.error("Erro no middleware de autenticação:", error);
        return res.status(500).json({ erro: "Erro de autenticação interno." });
    }
}

module.exports = authMiddleware;