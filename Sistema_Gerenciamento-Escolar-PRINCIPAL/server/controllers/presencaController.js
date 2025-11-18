const Presenca = require("../models/Presenca");

module.exports = {
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
    // LISTAR PRESENÇAS
    // -------------------------
    async listar(req, res) {
        try {
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
