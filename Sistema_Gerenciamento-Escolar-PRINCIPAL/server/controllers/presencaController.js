const Presenca = require("../models/Presenca");
const Aluno = require("../models/Aluno"); // Importa o modelo Aluno para buscar a lista de estudantes

module.exports = {
    
    // -------------------------
    // BUSCAR ALUNOS PARA MARCAÇÃO DE FREQUÊNCIA
    // Esta função será acessada pela rota protegida (com authMiddleware)
    // -------------------------
    
    
// FUNÇÃO MODIFICADA PARA INCLUIR CONTAGEM DE FALTAS
    async listarAlunosParaFrequencia(req, res) {
        try {
            // 1. Buscar todos os alunos
            let alunos = await Aluno.find()
                .select('nome matricula _id turma') 
                .lean(); 

            // 2. Criar um array de Promises para contar as faltas de cada aluno
            const alunosComFaltasPromises = alunos.map(async (aluno) => {
                // Contar documentos de presença onde o status é "ausente"
                const faltas = await Presenca.countDocuments({
                    alunoId: aluno._id, 
                    status: "ausente" 
                });
                
                // 3. Adicionar o campo 'totalFaltas' ao objeto aluno
                return {
                    ...aluno,
                    totalFaltas: faltas // Campo NOVO
                };
            });

            // Executar todas as contagens em paralelo
            const alunosComFaltas = await Promise.all(alunosComFaltasPromises);

            res.json({ mensagem: "Lista de Alunos para Frequência", alunos: alunosComFaltas });
        } catch (erro) {
            console.error("Erro ao buscar a lista de alunos:", erro);
            res.status(500).json({ erro: "Erro interno ao buscar a lista de alunos" });
        }
    },

    // -------------------------
    // SALVAR PRESENÇA
    // -------------------------
    async salvar(req, res) {
        try {
            const nova = await Presenca.create(req.body);
            res.json({ mensagem: "Presença salva!", dados: nova });
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao salvar presença" });
        }
    },

    // -------------------------
    // LISTAR PRESENÇAS (Registros já salvos)
    // -------------------------
    async listar(req, res) {
        try {
            // É recomendado usar .populate() aqui para trazer informações úteis da Presenca
            const lista = await Presenca.find(); 
            res.json(lista);
        } catch (erro) {
            res.status(500).json({ erro: "Erro ao listar presenças" });
        }
    },

    // -------------------------
    // RESUMO PARA O PAINEL
    // -------------------------
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