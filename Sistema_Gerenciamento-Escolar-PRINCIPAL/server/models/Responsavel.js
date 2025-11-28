const mongoose = require('mongoose');

const responsavelSchema = new mongoose.Schema({
    nome: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    telefone: { 
        type: String, 
        required: false, 
        trim: true 
    },
    aluno: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Aluno', 
        required: true,
        unique: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Responsavel', responsavelSchema);