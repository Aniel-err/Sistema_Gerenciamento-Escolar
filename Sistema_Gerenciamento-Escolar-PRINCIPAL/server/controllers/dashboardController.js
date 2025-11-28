const Presenca = require("../models/Presenca");

exports.getResumo = async (req, res) => {
    try {
        const total = await Presenca.countDocuments();

        const presentes = await Presenca.countDocuments({ status: "presente" }); 
        const ausentes = await Presenca.countDocuments({ status: "ausente" });
        const atrasados = await Presenca.countDocuments({ status: "atrasado" });

        if (total === 0) {
            return res.json({
                presentes: 0,
                ausentes: 0,
                atrasados: 0
            });
        }

        res.json({
            presentes: ((presentes / total) * 100).toFixed(1),
            ausentes: ((ausentes / total) * 100).toFixed(1),
            atrasados: ((atrasados / total) * 100).toFixed(1)
        });

    } catch (error) {
        console.error("Erro no resumo:", error);
        res.status(500).json({ error: "Erro ao gerar resumo" });
    }
};