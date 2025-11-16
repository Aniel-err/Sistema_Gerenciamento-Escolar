// server/controllers/authController.js

const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken'); // Para criar o "token" de login
const crypto = require('crypto'); // Para o token de "esquecer senha"
// Você precisará de um 'sendEmail' (vamos simular por enquanto)
// const sendEmail = require('../utils/sendEmail'); 

// --- Função de REGISTRO ---
exports.register = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        // 1. Verifica se o usuário já existe
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        // 2. Cria o novo usuário (a senha é criptografada pelo 'pre save' no Model)
        usuario = new Usuario({
            nome,
            email,
            senha,
            tipo 
        });

        await usuario.save();

        // 3. Responde com sucesso (poderia logar automaticamente aqui)
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar registrar.' });
    }
};

// --- Função de LOGIN ---
exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Procura o usuário e INCLUI a senha (que está com 'select: false' no Model)
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario) {
            return res.status(400).json({ message: 'Email ou senha inválidos.' });
        }

        // 2. Compara a senha digitada com a senha no banco
        const isMatch = await usuario.verificarSenha(senha); // Usando o método que está no Model
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou senha inválidos.' });
        }

        // 3. Cria um Token JWT (JSON Web Token)
        // Este token é o que mantém o usuário "logado" no frontend
        const token = jwt.sign(
            { id: usuario._id, role: usuario.tipo }, // Informação que vai no token
            'segredo123', // !! TROQUE ISSO POR UMA VARIÁVEL DE AMBIENTE !!
            { expiresIn: '8h' } // Token expira em 8 horas
        );

        // Remove a senha da resposta
        usuario.senha = undefined; 

        // 4. Envia a resposta com o token e os dados do usuário
        res.status(200).json({
            message: 'Login efetuado com sucesso!',
            token,
            usuario // Envia os dados do usuário (sem a senha)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar logar.' });
    }
};

// --- Função de ESQUECER SENHA ---
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            // Não diga que o usuário não existe (por segurança)
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
        }

        // 1. Cria um token de reset aleatório (usando o 'crypto' do Node.js)
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // 2. Define um tempo de expiração (1 hora)
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora em milissegundos

        // 3. Salva o token e a expiração no usuário (usando os campos que criamos no Model)
        usuario.resetToken = resetToken;
        usuario.resetTokenExpiry = resetTokenExpiry;
        await usuario.save();

        // 4. **AQUI VOCÊ ENVIARIA O E-MAIL DE VERDADE**
        // (Simulação por enquanto)
        console.log('--- SIMULAÇÃO DE ENVIO DE E-MAIL ---');
        console.log(`Para: ${email}`);
        console.log(`Token de Reset: ${resetToken}`);
        console.log('Link: http://localhost:3000/reset-password/' + resetToken); // O link que iria no e-mail
        // await sendEmail(email, "Reset de Senha", link);

        res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao processar recuperação de senha.' });
    }
};

// --- (Opcional) Função de RESETAR SENHA ---
// Esta é a função que o usuário acessa DEPOIS de clicar no link do e-mail
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body;

    try {
        // 1. Procura o usuário pelo token E verifica se não expirou
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } // $gt = "greater than" (maior que) agora
        });

        if (!usuario) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        // 2. Define a nova senha
        usuario.senha = senha;
        // 3. Limpa os campos de reset
        usuario.resetToken = undefined;
        usuario.resetTokenExpiry = undefined;
        
        await usuario.save(); // O 'pre save' no Model vai criptografar a nova senha

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao redefinir a senha.' });
    }
};