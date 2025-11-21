const Evento = require("../models/Eventos");

exports.criarEvento = async (req, res) => {
    try {
        const novo = await Evento.create({
            ...req.body,
            criadoPor: req.user.id
        });

        res.status(201).json(novo);
    } catch (error) {
        console.error("Erro ao criar evento:", error);
        res.status(500).json({ erro: "Erro ao criar evento" });
    }
};

exports.listarEventos = async (req, res) => {
    try {
        const eventos = await Evento.find().sort({ dataInicio: 1 });
        res.json(eventos);
    } catch (error) {
        console.error("Erro ao listar eventos:", error);
        res.status(500).json({ erro: "Erro ao listar eventos" });
    }
};

exports.buscarEvento = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) return res.status(404).json({ erro: "Evento não encontrado" });

        res.json(evento);
    } catch (error) {
        console.error("Erro ao buscar evento:", error);
        res.status(500).json({ erro: "Erro ao buscar evento" });
    }
};

exports.atualizarEvento = async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!evento) return res.status(404).json({ erro: "Evento não encontrado" });

        res.json(evento);
    } catch (error) {
        console.error("Erro ao atualizar evento:", error);
        res.status(500).json({ erro: "Erro ao atualizar evento" });
    }
};

exports.deletarEvento = async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Evento removido com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir evento:", error);
        res.status(500).json({ erro: "Erro ao excluir evento" });
    }
};
