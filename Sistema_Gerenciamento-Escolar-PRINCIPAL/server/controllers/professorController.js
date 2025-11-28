// server/controllers/professorController.js
const Professor = require('../models/Professor');
const Usuario = require('../models/Usuario');

module.exports = {
    async getProfessores(req, res) {
        try {
            const professores = await Professor.find().populate('usuarioId', 'email tipo');
            res.json(professores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao buscar professores.' });
        }
    },

    async createProfessor(req, res) {
        const { nome, email, telefone, disciplina, cargo } = req.body;

        try {
            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({ mensagem: 'E-mail já cadastrado no sistema.' });
            }

            const novoUsuario = await Usuario.create({
                nome,
                email,
                senha: '123456', 
                tipo: cargo || 'professor',
                emailVerificado: true
            });

            const novoProfessor = await Professor.create({
                nome,
                email,
                telefone,
                disciplina,
                cargo: cargo || 'professor',
                usuarioId: novoUsuario._id
            });

            res.status(201).json({ mensagem: 'Professor cadastrado com sucesso!', professor: novoProfessor });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao cadastrar professor.' });
        }
    },

    async updateProfessor(req, res) {
        const { id } = req.params;
        const { cargo, disciplina, telefone } = req.body;

        try {
            const professor = await Professor.findById(id);
            if (!professor) return res.status(404).json({ mensagem: 'Professor não encontrado.' });

            if (cargo) professor.cargo = cargo;
            if (disciplina) professor.disciplina = disciplina;
            if (telefone) professor.telefone = telefone;
            await professor.save();

            if (cargo) {
                await Usuario.findByIdAndUpdate(professor.usuarioId, { tipo: cargo });
            }

            res.json({ mensagem: 'Dados atualizados com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao atualizar.' });
        }
    },

    async deleteProfessor(req, res) {
        const { id } = req.params;
        try {
            const professor = await Professor.findById(id);
            if (!professor) return res.status(404).json({ mensagem: 'Professor não encontrado.' });

            await Usuario.findByIdAndDelete(professor.usuarioId);
            
            await Professor.findByIdAndDelete(id);

            res.json({ mensagem: 'Professor e usuário removidos.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao deletar.' });
        }
    }
};