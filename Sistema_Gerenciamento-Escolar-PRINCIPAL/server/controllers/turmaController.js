const Turma = require('../models/Turma');
const Professor = require('../models/Professor');
const Aluno = require('../models/Aluno');

exports.createTurma = async (req, res) => {
    const { nome, anoLetivo, periodo, serie, professorRegenteId } = req.body;

    try {
        const turmaExistente = await Turma.findOne({ nome, anoLetivo });
        if (turmaExistente) {
            return res.status(400).json({ mensagem: 'Já existe uma turma com este nome neste ano letivo.' });
        }

        const novaTurma = new Turma({
            nome,
            anoLetivo,
            serie,
            periodo,
            professores: professorRegenteId ? [professorRegenteId] : [] 
        });

        await novaTurma.save();
        res.status(201).json({ mensagem: 'Turma criada com sucesso!', turma: novaTurma });

    } catch (error) {
        console.error(error); 
        res.status(500).json({ mensagem: 'Erro no servidor ao criar turma.' });
    }
};

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


exports.updateTurma = async (req, res) => {
    const { id } = req.params;
    const { nome, anoLetivo, periodo, serie, professorRegenteId, status } = req.body;

    const dadosAtualizados = {
        nome,
        anoLetivo,
        periodo,
        serie,
        status
    };
    
    if (professorRegenteId) {
        dadosAtualizados.professores = [professorRegenteId];
    } else {
        dadosAtualizados.professores = [];
    }

    try {
        const turmaAtualizada = await Turma.findByIdAndUpdate(
            id,
            dadosAtualizados,
            { new: true }
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

     
        await Turma.findByIdAndDelete(id);

        res.status(200).json({ mensagem: 'Turma excluída com sucesso.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro no servidor ao deletar turma.' });
    }
};