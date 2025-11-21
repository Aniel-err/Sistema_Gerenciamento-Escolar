const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).json({ mensagem: "Token não enviado." });

    const parts = authHeader.split(" ");

    if (parts.length !== 2)
        return res.status(401).json({ mensagem: "Token inválido." });

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme))
        return res.status(401).json({ mensagem: "Token mal formatado." });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ mensagem: "Token inválido ou expirado." });

        req.user = { id: decoded.id, tipo: decoded.tipo };
        next();
    });
};
