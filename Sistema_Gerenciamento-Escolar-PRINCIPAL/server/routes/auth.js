const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const enviarEmailVerificacao = require("../utils/enviarEmailVerificacao");
const enviarEmailRecuperacao = require("../utils/enviarEmailRecuperacao");

const SECRET = "segredo123";

/* =======================================================
   🧩 CADASTRO COM VERIFICAÇÃO DE EMAIL
======================================================= */
router.post("/register", async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);

        // Gera token de verificação
        const tokenVerificacao = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacao = tokenVerificacao;
        usuario.emailVerificado = false;
        await usuario.save();

        // Envia email de verificação
        await enviarEmailVerificacao(usuario.email, tokenVerificacao);

        return res.json({
            mensagem: "Usuário criado! Verifique seu email para ativar a conta.",
            usuario
        });
    } catch (error) {
        console.error("Erro /register:", error);
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

/* =======================================================
   🔐 LOGIN BLOQUEANDO USUÁRIOS NÃO VERIFICADOS
======================================================= */
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select("+senha");
        if (!usuario) return res.status(400).json({ mensagem: "Usuário não encontrado." });

        const senhaValida = await usuario.verificarSenha(senha);
        if (!senhaValida) return res.status(400).json({ mensagem: "Senha incorreta." });

        if (!usuario.emailVerificado) {
            return res.status(401).json({ mensagem: "📧 Email não verificado. Verifique seu email!" });
        }

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
   📧 VERIFICAÇÃO DE EMAIL
======================================================= */
router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const usuario = await Usuario.findOne({ tokenVerificacao: token });
        if (!usuario) return res.send("❌ Token inválido ou expirado!");

        usuario.emailVerificado = true;
        usuario.tokenVerificacao = null;
        await usuario.save();

        res.send("✔ Email verificado com sucesso! Você já pode fazer login.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao verificar email.");
    }
});

/* =======================================================
   🔁 REENVIAR LINK DE VERIFICAÇÃO
======================================================= */
router.post("/resend-verification", async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ mensagem: "Usuário não encontrado." });

        if (usuario.emailVerificado) {
            return res.status(400).json({ mensagem: "Email já verificado." });
        }

        // Gera novo token de verificação
        const tokenVerificacao = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacao = tokenVerificacao;
        await usuario.save();

        await enviarEmailVerificacao(usuario.email, tokenVerificacao);

        return res.json({ mensagem: "📧 Link de verificação reenviado com sucesso!" });
    } catch (err) {
        console.error("Erro /resend-verification:", err);
        return res.status(500).json({ mensagem: "Erro ao reenviar o email de verificação." });
    }
});

/* =======================================================
   📩 ESQUECI MINHA SENHA
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
   🔑 FORMULÁRIO PARA REDIFINIR SENHA (GET)
======================================================= */
router.get("/reset-password/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!usuario) {
            return res.send("❌ Token inválido ou expirado!");
        }

        res.send(`
            <h2>Redefinir Senha</h2>
            <form action="/auth/reset-password/${token}" method="POST">
                <input type="password" name="novaSenha" placeholder="Nova senha" required />
                <button type="submit">Alterar senha</button>
            </form>
        `);

    } catch (error) {
        console.error("Erro GET /reset-password:", error);
        res.status(500).send("Erro ao carregar a página de redefinição de senha.");
    }
});

/* =======================================================
   🔑 REDIFINIR SENHA (POST)
======================================================= */
router.post("/reset-password/:token", async (req, res) => {
    const token = req.params.token;
    const novaSenha = req.body.novaSenha;

    console.log("req.body:", req.body);

    if (!novaSenha) {
        return res.status(400).send("❌ Nova senha não fornecida!");
    }

    try {
        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select("+senha");

        if (!usuario) {
            return res.status(400).send("❌ Token inválido ou expirado!");
        }

        usuario.senha = novaSenha;
        usuario.resetPasswordToken = null;
        usuario.resetPasswordExpires = null;

        await usuario.save();

        return res.send("🔑 Senha alterada com sucesso! Você já pode fazer login com a nova senha.");

    } catch (error) {
        console.error("Erro /reset-password:", error);
        return res.status(500).send("Erro ao redefinir a senha.");
    }
});

module.exports = router;
