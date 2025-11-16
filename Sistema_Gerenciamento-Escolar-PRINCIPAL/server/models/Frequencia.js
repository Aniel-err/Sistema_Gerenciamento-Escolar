// server/models/Frequencia.js

const mongoose = require('mongoose');

const FrequenciaSchema = new mongoose.Schema({
    alunoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aluno',
        required: true
    },
    turmaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Turma',
        required: true
    },
    data: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Presente', 'Falta'],
        required: true
    },
    justificativa: {
        type: String,
        default: null
    },
    // Quem registrou a frequência (para auditoria)
    registradoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario' 
    }
});

const Frequencia = mongoose.model('Frequencia', FrequenciaSchema);

module.exports = Frequencia;