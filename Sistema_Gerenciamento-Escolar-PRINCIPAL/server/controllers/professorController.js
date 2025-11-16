// server/controllers/professorController.js

const Professor = require('../models/Professor');

// --- Listar todos os Professores ---
// (Vamos usar isso para preencher o dropdown)
exports.getProfessores = async (req, res) => {
    try {
        // Busca todos os professores, mas retorna apenas o nome e o _id
        const professores = await Professor.find().select('nome _id');
        
        res.status(200).json(professores);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro no servidor ao buscar professores.' });
    }
};

// (No futuro, você adicionará aqui 'createProfessor', 'updateProfessor', etc.)