const mongoose = require("mongoose");

const PresencaSchema = new mongoose.Schema({
    alunoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Aluno",
        required: true
    },
    status: { type: String, enum: ["presente", "ausente", "atrasado"], required: true },
    uniforme: Boolean,
    material: Boolean,
    comportamento: Boolean,
    observacao: String,
    dataRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Presenca", PresencaSchema);
