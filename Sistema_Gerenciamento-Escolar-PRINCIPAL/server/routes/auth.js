const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const enviarEmailRecuperacao = require("../utils/enviarEmailRecuperacao");

const SECRET = "segredo123";

/* =======================================================
   🧩 CADASTRO
======================================================= */
router.post("/register", async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);
        return res.json({ mensagem: "Usuário criado com sucesso!", usuario });
    } catch (error) {
        console.error("Erro /register:", error);
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

/* =======================================================
   🔐 LOGIN
======================================================= */
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select("+senha");
        if (!usuario) return res.status(400).json({ mensagem: "Usuário não encontrado." });

        const senhaValida = await usuario.verificarSenha(senha);
        if (!senhaValida) return res.status(400).json({ mensagem: "Senha incorreta." });

        const token = jwt.sign({ id: usuario._id }, SECRET, { expiresIn: "7d" });

        return res.json({
            mensagem: "Login realizado!",
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        console.error("Erro /login:", error);
        return res.status(500).json({ mensagem: "Erro ao fazer login." });
    }
});

/* =======================================================
   📩 PEDIR RECUPERAÇÃO DE SENHA
======================================================= */
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.json({ mensagem: "📩 Se o e-mail existir, você receberá o link." });
        }

        const token = crypto.randomBytes(32).toString("hex");

        usuario.resetPasswordToken = token;
        usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await usuario.save();

        const link = `http://localhost:3000/auth/reset-password/${token}`;
        await enviarEmailRecuperacao(email, link);

        console.log("\n=== RESET TOKEN GERADO ===");
        console.log("Token:", token);
        console.log("Expira em:", usuario.resetPasswordExpires);
        console.log("==========================\n");

        return res.json({ mensagem: "📩 Se o e-mail existir, você receberá o link." });

    } catch (error) {
        console.error("Erro /forgot-password:", error);
        return res.status(500).json({ mensagem: "Erro ao enviar o e-mail." });
    }
});

/* =======================================================
   🔑 RESETAR SENHA (POST)
======================================================= */
router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { novaSenha } = req.body;

    try {
        console.log("\n=== ROTA RESET PASSWORD ACIONADA ===");
        console.log("Token recebido:", token);

        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select("+senha");

        console.log("Usuário encontrado:", usuario ? usuario.email : "NÃO ENCONTRADO");
        console.log("====================================\n");

        if (!usuario) {
            return res.status(400).json({ mensagem: "❌ Token inválido ou expirado!" });
        }

        usuario.senha = novaSenha; // será criptografada pelo pre('save')
        usuario.resetPasswordToken = null;
        usuario.resetPasswordExpires = null;

        await usuario.save();

        return res.json({ mensagem: "🔑 Senha alterada com sucesso!" });

    } catch (error) {
        console.error("Erro /reset-password:", error);
        return res.status(500).json({ mensagem: "Erro ao redefinir a senha." });
    }
});

/* =======================================================
   EXPORT
======================================================= */
module.exports = router;
