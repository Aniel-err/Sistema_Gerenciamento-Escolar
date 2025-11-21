const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    descricao: { type: String },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    local: { type: String },
    turmas: [{ type: String }], // lista de turmas afetadas
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuarios" },
    status: {
        type: String,
        enum: ["ativo", "cancelado", "finalizado"],
        default: "ativo"
    },
    criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Eventos", EventoSchema);
