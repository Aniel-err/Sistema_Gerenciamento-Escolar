// server/controllers/alunoController.js
const Aluno = require('../models/Aluno');
const Turma = require('../models/Turma');

module.exports = {
    // Criar Aluno
    async create(req, res) {
        try {
            const { nome, matricula, turmaId, responsavel } = req.body;

            // Verifica se já existe matrícula
            const alunoExistente = await Aluno.findOne({ matricula });
            if (alunoExistente) {
                return res.status(400).json({ mensagem: "Matrícula já cadastrada." });
            }

            const novoAluno = await Aluno.create({
                nome,
                matricula,
                turma: turmaId, // ID da turma selecionada
                responsavel
            });

            // ATUALIZA A TURMA: Adiciona o ID do aluno no array 'alunos' da turma
            if (turmaId) {
                await Turma.findByIdAndUpdate(turmaId, { 
                    $push: { alunos: novoAluno._id } 
                });
            }

            res.status(201).json(novoAluno);

        } catch (error) {
            console.error("Erro ao criar aluno:", error);
            res.status(500).json({ mensagem: "Erro ao cadastrar aluno." });
        }
    },

    // Listar Alunos (Com dados da Turma)
    async getAll(req, res) {
        try {
            // .populate('turma') traz os dados da turma em vez de só o ID
            const alunos = await Aluno.find().populate('turma', 'nome');
            res.json(alunos);
        } catch (error) {
            res.status(500).json({ mensagem: "Erro ao buscar alunos." });
        }
    },

    // Deletar Aluno
    async delete(req, res) {
        try {
            const { id } = req.params;
            const aluno = await Aluno.findById(id);

            if (!aluno) return res.status(404).json({ mensagem: "Aluno não encontrado." });

            // Remove o aluno da lista da Turma também
            if (aluno.turma) {
                await Turma.findByIdAndUpdate(aluno.turma, { 
                    $pull: { alunos: aluno._id } 
                });
            }

            await Aluno.findByIdAndDelete(id);
            res.json({ mensagem: "Aluno removido com sucesso." });

        } catch (error) {
            res.status(500).json({ mensagem: "Erro ao deletar aluno." });
        }
    }
};