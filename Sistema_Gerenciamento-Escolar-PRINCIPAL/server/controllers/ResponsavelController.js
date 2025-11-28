const Responsavel = require('../models/Responsavel');
const Aluno = require('../models/Aluno'); 

class ResponsavelController {
    async cadastrarResponsavel(req, res) {
        const { nome, email, telefone, alunoIdentificador } = req.body; 

        try {
            const alunoEncontrado = await Aluno.findOne({
                $or: [{ matricula: alunoIdentificador }, { email: alunoIdentificador }, { _id: alunoIdentificador }]
            });

            if (!alunoEncontrado) {
                return res.status(404).json({ mensagem: 'Aluno não encontrado. Verifique a matrícula/email.' });
            }
            
            const novoResponsavel = new Responsavel({
                nome, email, telefone, 
                aluno: alunoEncontrado._id 
            });

            const responsavelSalvo = await novoResponsavel.save();
            return res.status(201).json({ mensagem: 'Responsável cadastrado e vinculado com sucesso!', responsavel: responsavelSalvo });

        } catch (error) {
            if (error.code === 11000) { 
                return res.status(400).json({ mensagem: 'E-mail ou Aluno já possui um responsável cadastrado.' });
            }
            console.error('Erro ao cadastrar responsável:', error);
            return res.status(500).json({ erro: error.message });
        }
    }

      async listarResponsaveis(req, res) {
        try {
            const responsaveis = await Responsavel.find({})
                .populate('aluno', 'nome matricula email') 
                .select('-__v')
                .exec(); 

            return res.status(200).json(responsaveis);
        } catch (error) {
            console.error('Erro ao listar responsáveis:', error);
            return res.status(500).json({ erro: "Erro ao buscar responsáveis." });
        }
    }
    
    async atualizarResponsavel(req, res) {
        try {
            const responsavelAtualizado = await Responsavel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            if (!responsavelAtualizado) {
                return res.status(404).json({ mensagem: "Responsável não encontrado." });
            }
            res.status(200).json({ mensagem: "Responsável atualizado com sucesso!", responsavel: responsavelAtualizado });
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
    

    async deletarResponsavel(req, res) {
        try {
            const responsavelDeletado = await Responsavel.findByIdAndDelete(req.params.id);
            if (!responsavelDeletado) {
                return res.status(404).json({ mensagem: "Responsável não encontrado." });
            }
            res.status(200).json({ mensagem: "Responsável excluído com sucesso!" });
        } catch (erro) {
            res.status(500).json({ erro: erro.message });
        }
    }
}

module.exports = new ResponsavelController();