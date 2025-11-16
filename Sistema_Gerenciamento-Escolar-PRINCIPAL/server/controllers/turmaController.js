// server/controllers/turmaController.js

const Turma = require('../models/Turma');
const Professor = require('../models/Professor');
const Aluno = require('../models/Aluno');

// --- Criar uma nova Turma ---
exports.createTurma = async (req, res) => {
    // Pega os dados do corpo da requisição (do modal do frontend)
    const { nome, anoLetivo, periodo, serie, professorRegenteId } = req.body;

    try {
        const turmaExistente = await Turma.findOne({ nome, anoLetivo });
        if (turmaExistente) {
            return res.status(400).json({ mensagem: 'Já existe uma turma com este nome neste ano letivo.' });
        }

        const novaTurma = new Turma({
            nome,
            anoLetivo,
            serie, // Adicionado (caso você tenha no model)
            periodo,
            professores: professorRegenteId ? [professorRegenteId] : [] 
        });

        await novaTurma.save();
        res.status(201).json({ mensagem: 'Turma criada com sucesso!', turma: novaTurma });

    } catch (error) {
        console.error(error); // Mostra o erro real no console do backend
        res.status(500).json({ mensagem: 'Erro no servidor ao criar turma.' });
    }
};

// --- Listar todas as Turmas ---
exports.getTurmas = async (req, res) => {
    try {
        const turmas = await Turma.find()
            .populate('professores', 'nome') 
            .populate('alunos', 'nome'); 

        res.status(200).json(turmas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro no servidor ao buscar turmas.' });
    }
};

// --- **NOVO** - Buscar UMA Turma por ID ---
// (Necessário para a função de Editar)
exports.getTurmaById = async (req, res) => {
    try {
        const turma = await Turma.findById(req.params.id);
        if (!turma) {
            return res.status(404).json({ mensagem: 'Turma não encontrada.' });
        }
        res.status(200).json(turma);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro no servidor ao buscar turma.' });
    }
};


// --- Atualizar uma Turma (EDITAR) ---
exports.updateTurma = async (req, res) => {
    const { id } = req.params;
    const { nome, anoLetivo, periodo, serie, professorRegenteId, status } = req.body;

    // Constrói o objeto de atualização
    const dadosAtualizados = {
        nome,
        anoLetivo,
        periodo,
        serie,
        status
    };
    
    // Só atualiza o professor se um novo foi enviado
    if (professorRegenteId) {
        dadosAtualizados.professores = [professorRegenteId];
    } else {
        // Se "Nenhum" for selecionado, limpa o array de professores
        dadosAtualizados.professores = [];
    }

    try {
        const turmaAtualizada = await Turma.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true } // Retorna o documento atualizado
        );

        if (!turmaAtualizada) {
            return res.status(404).json({ mensagem: 'Turma não encontrada.' });
        }

        res.status(200).json({ mensagem: 'Turma atualizada com sucesso!', turma: turmaAtualizada });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro no servidor ao atualizar turma.' });
    }
};

// --- Deletar uma Turma (CORRIGIDO) ---
exports.deleteTurma = async (req, res) => {
    const { id } = req.params;

    try {
        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ mensagem: 'Turma não encontrada.' });
        }

        if (turma.alunos && turma.alunos.length > 0) {
            return res.status(400).json({ mensagem: 'Não é possível excluir. Esta turma tem alunos. Mova-a para "Inativas" (edite o status).' });
        }

        // --- CORREÇÃO AQUI ---
        // Trocamos 'turma.remove()' por 'Turma.findByIdAndDelete(id)'
        await Turma.findByIdAndDelete(id);
        // ---------------------

        res.status(200).json({ mensagem: 'Turma excluída com sucesso.' });

    } catch (error) {
        console.error(error); // Mostra o erro real no console do backend
        res.status(500).json({ mensagem: 'Erro no servidor ao deletar turma.' });
    }
};