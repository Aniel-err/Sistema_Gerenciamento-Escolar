// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Usuario = require("../models/Usuario");
const enviarEmailVerificacao = require("../utils/enviarEmailVerificacao");
const enviarEmailRecuperacao = require("../utils/enviarEmailRecuperacao");
const auth = require("../middlewares/authMiddleware"); // Middleware de proteção

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Nomeia o arquivo com o ID do usuário + data para não repetir
        const ext = path.extname(file.originalname);
        cb(null, req.user.id + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });
// ---------------------------------------

const SECRET = process.env.JWT_SECRET;

// 1. ROTA DE REGISTRO
router.post("/register", async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);
        const tokenVerificacao = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacao = tokenVerificacao;
        usuario.emailVerificado = false;
        await usuario.save();

        await enviarEmailVerificacao(usuario.email, tokenVerificacao);

        return res.json({
            mensagem: "Usuário criado! Verifique seu email.",
            usuario: { nome: usuario.nome, email: usuario.email, tipo: usuario.tipo }
        });
    } catch (error) {
        console.error("Erro /register:", error);
        if (error.code === 11000) return res.status(400).json({ mensagem: "E-mail já cadastrado." });
        return res.status(500).json({ mensagem: "Erro ao cadastrar." });
    }
});

// 2. ROTA DE LOGIN
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ email }).select('+senha'); 
        if (!usuario || !(await usuario.verificarSenha(senha))) {
            return res.status(401).json({ mensagem: "Email ou senha incorretos." });
        }
        if (!usuario.emailVerificado) {
            return res.status(403).json({ mensagem: "Verifique seu e-mail." });
        }

        const token = jwt.sign(
            { id: usuario._id, tipo: usuario.tipo }, 
            SECRET, 
            { expiresIn: '8h' }
        );

        return res.json({ 
            mensagem: "Login realizado!",
            token,
            usuario: { 
                id: usuario._id,
                nome: usuario.nome, 
                email: usuario.email, 
                tipo: usuario.tipo,
                foto: usuario.foto // Retorna a foto no login
            }
        });

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro no login." });
    }
});

// 3. ROTA DE ATUALIZAÇÃO DE PERFIL (A QUE ESTAVA FALTANDO/DANDO ERRO)
// Usa 'auth' para garantir que está logado e 'upload.single' para processar a foto
router.put("/update", auth, upload.single('foto'), async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, senha } = req.body;

        const usuario = await Usuario.findById(userId).select('+senha');
        if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado." });

        if (nome) usuario.nome = nome;
        
        if (senha && senha.trim() !== "") {
            usuario.senha = senha; 
        }

        // Se enviou foto, salva o caminho
        if (req.file) {
            // Corrige barras invertidas do Windows
            usuario.foto = req.file.path.replace(/\\/g, "/"); 
        }

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

// 4. OUTRAS ROTAS (Verify, Forgot, Reset)
router.get("/verify/:token", async (req, res) => {
    /* ... código de verify igual ao anterior ... */
    try {
        const usuario = await Usuario.findOne({ tokenVerificacao: req.params.token });
        if (!usuario) return res.status(400).send("Token inválido");
        usuario.emailVerificado = true;
        usuario.tokenVerificacao = null;
        await usuario.save();
        res.send("E-mail verificado!");
    } catch (e) { res.status(500).send("Erro"); }
});

router.post("/forgot-password", async (req, res) => {
    /* ... código de forgot password ... */
    try {
        const { email } = req.body;
        const usuario = await Usuario.findOne({ email });
        if(usuario) {
            const token = crypto.randomBytes(32).toString("hex");
            usuario.resetPasswordToken = token;
            usuario.resetPasswordExpires = Date.now() + 3600000;
            await usuario.save();
            const link = `http://localhost:3000/auth/reset-password/${token}`;
            await enviarEmailRecuperacao(email, link);
        }
        res.json({ mensagem: "Se o email existir, enviamos o link." });
    } catch (e) { res.status(500).json({ erro: "Erro no servidor" }); }
});

router.get("/reset-password/:token", async (req, res) => {
    /* ... código de reset GET ... */
    res.send(`<form method="POST" action="/auth/reset-password/${req.params.token}"><input type="password" name="novaSenha"/><button>Mudar</button></form>`);
});

router.post("/reset-password/:token", async (req, res) => {
    /* ... código de reset POST ... */
    try {
        const usuario = await Usuario.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if(!usuario) return res.status(400).send("Token inválido");
        usuario.senha = req.body.novaSenha;
        usuario.resetPasswordToken = null;
        usuario.resetPasswordExpires = null;
        await usuario.save();
        res.send("Senha alterada!");
    } catch (e) { res.status(500).send("Erro"); }
});

module.exports = router;