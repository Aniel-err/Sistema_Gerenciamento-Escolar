const Presenca = require("../models/Presenca");
const Aluno = require("../models/Aluno"); 

module.exports = {

    async listarAlunosParaFrequencia(req, res) {
        try {
            let alunos = await Aluno.find()
                .select('nome matricula _id turma') 
                .lean(); 

            const alunosComFaltasPromises = alunos.map(async (aluno) => {
                const faltas = await Presenca.countDocuments({
                    alunoId: aluno._id, 
                    status: "ausente" 
                });
                
                return {
                    ...aluno,
                    totalFaltas: faltas 
                };
            });

            const alunosComFaltas = await Promise.all(alunosComFaltasPromises);

            res.json({ mensagem: "Lista de Alunos para Frequência", alunos: alunosComFaltas });
        } catch (erro) {
            console.error("Erro ao buscar a lista de alunos:", erro);
            res.status(500).json({ erro: "Erro interno ao buscar a lista de alunos" });
        }
    },

    async salvar(req, res) {
        try {
            const nova = await Presenca.create(req.body);
            res.json({ mensagem: "Presença salva!", dados: nova });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao salvar presença" });
        }
    },


    async listar(req, res) {
        try {
            const lista = await Presenca.find(); 
            res.json(lista);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao listar presenças" });
        }
    },

    async resumo(req, res) {
        try {
            const total = await Presenca.countDocuments();
            const presentes = await Presenca.countDocuments({ status: "presente" });
            const ausentes = await Presenca.countDocuments({ status: "ausente" });
            const atrasados = await Presenca.countDocuments({ status: "atrasado" });

            const pct = (v) => total === 0 ? 0 : ((v / total) * 100).toFixed(1);

            res.json({
                total,
                presentes: pct(presentes),
                ausentes: pct(ausentes),
                atrasados: pct(atrasados)
            });

        } catch (error) {
            res.status(500).json({ erro: "Erro ao gerar resumo" });
        }
    }
};