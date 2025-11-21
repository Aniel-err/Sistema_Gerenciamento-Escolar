// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const enviarEmailVerificacao = require("../utils/enviarEmailVerificacao");
const enviarEmailRecuperacao = require("../utils/enviarEmailRecuperacao");
const auth = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// --- Configuração de upload ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, req.user.id + "-" + Date.now() + ext);
    }
});
const upload = multer({ storage: storage });
// --------------------------------

// 1. REGISTRO
router.post("/register", async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);
        const tokenVerificacao = usuario.gerarTokenVerificacao();
        await enviarEmailVerificacao(usuario.email, tokenVerificacao);

        return res.json({
            mensagem: "Usuário criado! Verifique seu email.",
            usuario: {
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo
            }
        });

    } catch (error) {
        console.error("Erro /register:", error);
        if (error.code === 11000)
            return res.status(400).json({ mensagem: "E-mail já cadastrado." });

        return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
    }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select("+senha");
        if (!usuario || !(await usuario.verificarSenha(senha))) {
            return res.status(401).json({ mensagem: "Email ou senha incorretos." });
        }

        if (!usuario.emailVerificado) {
            const token = usuario.gerarTokenVerificacao();
            const resultado = await enviarEmailVerificacao(usuario.email, token);

            return res.status(403).json({
                mensagem: "E-mail não verificado. Um novo link de verificação foi enviado.",
                enviado: resultado?.success
            });
        }

        const tokenJWT = jwt.sign(
            { id: usuario._id, tipo: usuario.tipo },
            SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            mensagem: "Login realizado!",
            token: tokenJWT,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                foto: usuario.foto
            }
        });

    } catch (error) {
        console.error("Erro /login:", error);
        return res.status(500).json({ mensagem: "Erro no login." });
    }
});

// 3. UPDATE DE PERFIL (COM FOTO)
router.put("/update", auth, upload.single("foto"), async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, senha } = req.body;

        const usuario = await Usuario.findById(userId).select("+senha");
        if (!usuario)
            return res.status(404).json({ mensagem: "Usuário não encontrado." });

        if (nome) usuario.nome = nome;
        if (senha && senha.trim() !== "") usuario.senha = senha;
        if (req.file) usuario.foto = req.file.path.replace(/\\/g, "/");

        await usuario.save();

        res.json({
            mensagem: "Perfil atualizado com sucesso!",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
                foto: usuario.foto
            }
        });

    } catch (error) {
        console.error("Erro /update:", error);
        res.status(500).json({ mensagem: "Erro ao atualizar perfil." });
    }
});

// 4. VERIFICAÇÃO DE EMAIL
router.get("/verify/:token", async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ tokenVerificacao: req.params.token });
        if (!usuario) return res.status(400).send("Token inválido!");

        usuario.emailVerificado = true;
        usuario.tokenVerificacao = null;
        usuario.tokenVerificacaoExpira = null;
        await usuario.save();

        res.send("E-mail verificado com sucesso!");
    } catch (e) {
        console.error("Erro /verify:", e);
        res.status(500).send("Erro ao verificar e-mail.");
    }
});

// 5. REENVIAR LINK DE VERIFICAÇÃO
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ mensagem: "Email é obrigatório." });

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.json({ mensagem: "Se o email existir, enviamos o link." });
        }

        if (usuario.emailVerificado) {
            return res.status(400).json({ mensagem: "Email já verificado." });
        }

        const novoToken = usuario.gerarTokenVerificacao();
        const resultado = await enviarEmailVerificacao(email, novoToken);

        if (resultado && resultado.success) {
            return res.json({ mensagem: "Novo link de verificação enviado!" });
        } else {
            console.error("Erro ao enviar email:", resultado?.error);
            return res.status(500).json({ mensagem: "Erro ao enviar email." });
        }

    } catch (error) {
        console.error("Erro /resend-verification:", error);
        res.status(500).json({ mensagem: "Erro ao reenviar verificação." });
    }
});

// 6. ESQUECI A SENHA
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email });

        if (usuario) {
            const token = crypto.randomBytes(32).toString("hex");
            usuario.resetPasswordToken = token;
            usuario.resetPasswordExpires = Date.now() + 3600000; // 1 hora
            await usuario.save();

            const link = `${FRONTEND_URL}/auth/reset-password/${token}`;
            await enviarEmailRecuperacao(email, link);
        }

        res.json({ mensagem: "Se o email existir, enviamos o link para redefinir." });

    } catch (e) {
        console.error("Erro /forgot-password:", e);
        res.status(500).json({ erro: "Erro ao enviar email." });
    }
});

// 7. FORMULÁRIO DE RESET DE SENHA
router.get("/reset-password/:token", async (req, res) => {
    res.send(`
        <form method="POST" action="/auth/reset-password/${req.params.token}">
            <input type="password" name="novaSenha" placeholder="Nova senha"/>
            <button>Alterar</button>
        </form>
    `);
});

// 8. RESET DE SENHA
router.post("/reset-password/:token", async (req, res) => {
    try {
        const usuario = await Usuario.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!usuario) return res.status(400).send("Token inválido ou expirado.");

        usuario.senha = req.body.novaSenha;
        usuario.resetPasswordToken = null;
        usuario.resetPasswordExpires = null;
        await usuario.save();

        res.send("Senha alterada com sucesso!");
    } catch (e) {
        console.error("Erro /reset-password:", e);
        res.status(500).send("Erro ao redefinir senha.");
    }
});

module.exports = router;
