// server/routes/auth.js (CORRIGIDO)
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const enviarEmailVerificacao = require("../utils/enviarEmailVerificacao");
const enviarEmailRecuperacao = require("../utils/enviarEmailRecuperacao");

// 🚨 CORREÇÃO: Usando a chave secreta do arquivo .env
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error("JWT_SECRET não está definido! Rotas de login falharão.");
}

/* =======================================================
   🧩 CADASTRO COM VERIFICAÇÃO DE EMAIL
======================================================= */
router.post("/register", async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);

        const tokenVerificacao = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacao = tokenVerificacao;
        usuario.emailVerificado = false;
        await usuario.save();

        await enviarEmailVerificacao(usuario.email, tokenVerificacao);

        return res.json({
            mensagem: "Usuário criado! Verifique seu email para ativar a conta.",
            usuario: { 
                nome: usuario.nome, 
                email: usuario.email, 
                tipo: usuario.tipo 
            }
        });
    } catch (error) {
        console.error("Erro /register:", error);
        if (error.code === 11000) { 
            return res.status(400).json({ mensagem: "E-mail já cadastrado." });
        }
        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

/* =======================================================
   🔐 LOGIN BLOQUEANDO USUÁRIOS NÃO VERIFICADOS
======================================================= */
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('+senha'); 

        if (!usuario || !(await usuario.verificarSenha(senha))) {
            return res.status(401).json({ mensagem: "Email ou senha incorretos." });
        }

        if (!usuario.emailVerificado) {
            return res.status(403).json({ mensagem: "Verifique seu e-mail para ativar a conta." });
        }

        // 🚨 CORREÇÃO: Usando o SECRET e a expiração do .env
        const token = jwt.sign(
            { id: usuario._id, tipo: usuario.tipo }, 
            SECRET, 
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        return res.json({ 
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: { nome: usuario.nome, tipo: usuario.tipo }
        });

    } catch (error) {
        console.error("Erro /login:", error);
        return res.status(500).json({ mensagem: "Erro no servidor ao fazer login." });
    }
});

/* =======================================================
   📧 VERIFICAÇÃO DE EMAIL
======================================================= */
router.get("/verify/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const usuario = await Usuario.findOne({ tokenVerificacao: token });

        if (!usuario) {
            return res.status(400).send("❌ Token de verificação inválido!");
        }

        if (usuario.emailVerificado) {
            return res.send("✅ E-mail já estava verificado.");
        }

        usuario.emailVerificado = true;
        usuario.tokenVerificacao = null; 
        await usuario.save();

        return res.send(`
            <h2>✅ E-mail verificado com sucesso!</h2>
            <p>Sua conta está ativa. Você pode fechar esta página e fazer login no sistema.</p>
        `);

    } catch (error) {
        console.error("Erro /verify:", error);
        res.status(500).send("Erro ao verificar e-mail.");
    }
});

/* =======================================================
   🔒 SOLICITAR REDEFINIÇÃO DE SENHA (POST)
======================================================= */
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(200).json({ mensagem: "Se o e-mail estiver cadastrado, um link de recuperação foi enviado." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        
        usuario.resetPasswordToken = resetToken;
        usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await usuario.save();

        const linkRecuperacao = `http://localhost:3000/auth/reset-password/${resetToken}`;
        await enviarEmailRecuperacao(usuario.email, linkRecuperacao);

        res.status(200).json({ mensagem: "Se o e-mail estiver cadastrado, um link de recuperação foi enviado." });

    } catch (error) {
        console.error("Erro /forgot-password:", error);
        res.status(500).json({ mensagem: "Erro ao solicitar recuperação de senha." });
    }
});

/* =======================================================
   🔗 REDEFINIR SENHA (GET - Página HTML)
======================================================= */
router.get("/reset-password/:token", async (req, res) => {
    const token = req.params.token;

    try {
        const usuario = await Usuario.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!usuario) {
            return res.status(400).send("❌ Token de recuperação inválido ou expirado!");
        }

        // Retorna a página HTML com o formulário de nova senha
        return res.send(`
            <h2>Alterar Senha</h2>
            <form method="POST" action="/auth/reset-password/${token}">
                <label for="novaSenha">Nova Senha:</label>
                <input type="password" id="novaSenha" name="novaSenha" placeholder="Nova senha" required />
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

        await usuario.save(); // O pre('save') criptografa a nova senha

        return res.send("🔑 Senha alterada com sucesso! Você já pode fazer login com a nova senha.");
    } catch (error) {
        console.error("Erro POST /reset-password:", error);
        return res.status(500).send("Erro ao alterar a senha.");
    }
});

module.exports = router;