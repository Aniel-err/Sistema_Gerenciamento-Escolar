// server/controllers/professorController.js
const Professor = require('../models/Professor');
const Usuario = require('../models/Usuario');

module.exports = {
    // Listar todos (com dados do usuário populados)
    async getProfessores(req, res) {
        try {
            const professores = await Professor.find().populate('usuarioId', 'email tipo');
            res.json(professores);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao buscar professores.' });
        }
    },

    // Criar Professor (Cria também o Usuario de login)
    async createProfessor(req, res) {
        const { nome, email, telefone, disciplina, cargo } = req.body;

        try {
            // 1. Verifica se email já existe
            const usuarioExistente = await Usuario.findOne({ email });
            if (usuarioExistente) {
                return res.status(400).json({ mensagem: 'E-mail já cadastrado no sistema.' });
            }

            // 2. Cria o Usuário de Login (Senha padrão: 123456)
            // O usuário terá o tipo igual ao cargo (professor ou coordenador)
            const novoUsuario = await Usuario.create({
                nome,
                email,
                senha: '123456', // Senha padrão inicial
                tipo: cargo || 'professor',
                emailVerificado: true // Como o admin criou, já validamos
            });

            // 3. Cria o Perfil do Professor
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

    // Atualizar Cargo (Promover/Rebaixar) ou Dados
    async updateProfessor(req, res) {
        const { id } = req.params;
        const { cargo, disciplina, telefone } = req.body;

        try {
            const professor = await Professor.findById(id);
            if (!professor) return res.status(404).json({ mensagem: 'Professor não encontrado.' });

            // Atualiza dados do Professor
            if (cargo) professor.cargo = cargo;
            if (disciplina) professor.disciplina = disciplina;
            if (telefone) professor.telefone = telefone;
            await professor.save();

            // Se mudou o cargo, atualiza o tipo do Usuário também (para permissões de login)
            if (cargo) {
                await Usuario.findByIdAndUpdate(professor.usuarioId, { tipo: cargo });
            }

            res.json({ mensagem: 'Dados atualizados com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao atualizar.' });
        }
    },

    // Deletar Professor
    async deleteProfessor(req, res) {
        const { id } = req.params;
        try {
            const professor = await Professor.findById(id);
            if (!professor) return res.status(404).json({ mensagem: 'Professor não encontrado.' });

            // Deleta o Usuário de login vinculado
            await Usuario.findByIdAndDelete(professor.usuarioId);
            
            // Deleta o perfil
            await Professor.findByIdAndDelete(id);

            res.json({ mensagem: 'Professor e usuário removidos.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Erro ao deletar.' });
        }
    }
};