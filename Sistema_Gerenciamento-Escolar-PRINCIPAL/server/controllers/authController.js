const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken'); 
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { nome, email, senha, tipo } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
        }

        usuario = new Usuario({
            nome,
            email,
            senha,
            tipo 
        });

        await usuario.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar registrar.' });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({ email }).select('+senha');
        if (!usuario) {
            return res.status(400).json({ message: 'Email ou senha inválidos.' });
        }

        const isMatch = await usuario.verificarSenha(senha);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou senha inválidos.' });
        }

        const token = jwt.sign(
            { id: usuario._id, role: usuario.tipo },
            'segredo123',
            { expiresIn: '8h' } 
        );

        usuario.senha = undefined; 

        res.status(200).json({
            message: 'Login efetuado com sucesso!',
            token,
            usuario 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor ao tentar logar.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        
        const resetTokenExpiry = Date.now() + 3600000; 

        usuario.resetToken = resetToken;
        usuario.resetTokenExpiry = resetTokenExpiry;
        await usuario.save();

        console.log('--- SIMULAÇÃO DE ENVIO DE E-MAIL ---');
        console.log(`Para: ${email}`);
        console.log(`Token de Reset: ${resetToken}`);
        console.log('Link: http://localhost:3000/reset-password/' + resetToken); 

        res.status(200).json({ message: 'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao processar recuperação de senha.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body;

    try {
        const usuario = await Usuario.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() } 
        });

        if (!usuario) {
            return res.status(400).json({ message: 'Token inválido ou expirado.' });
        }

        usuario.senha = senha;
        usuario.resetToken = undefined;
        usuario.resetTokenExpiry = undefined;
        
        await usuario.save(); 

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao redefinir a senha.' });
    }
};