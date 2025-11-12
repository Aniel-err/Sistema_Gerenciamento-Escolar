const mongoose = require('mongoose');
const Professor = require('./models/Professor');
const Turma = require('./models/Turma');
const Aluno = require('./models/Aluno');

const uri = "mongodb+srv://lucaslviana07_db_user:jumento123@cluster0.zmpci15.mongodb.net/escola?appName=Cluster0";

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Conectado ao MongoDB Atlas');

    // Cria uma turma
    const novaTurma = new Turma({
      nome: '9º Ano A',
      anoLetivo: '2025',
      periodo: 'Matutino'
    });
    await novaTurma.save();

    // Cria um professor
    const novoProfessor = new Professor({
      nome: 'Carlos Andrade',
      email: 'carlos@escola.com',
      telefone: '11988887777',
      cargo: 'professor',
      disciplina: 'Matemática',
      turma: novaTurma._id
    });
    await novoProfessor.save();

    // Cria um coordenador
    const novoCoordenador = new Professor({
      nome: 'Ana Souza',
      email: 'ana@escola.com',
      telefone: '11999996666',
      cargo: 'coordenador',
      disciplina: 'Geral'
    });
    await novoCoordenador.save();

    // Cria um aluno
    const novoAluno = new Aluno({
      nome: 'Lucas Silva',
      matricula: 'A12345',
      turma: novaTurma._id,
      responsavel: 'Maria Silva'
    });
    await novoAluno.save();

    console.log('✅ Dados criados com sucesso!');
    process.exit();
  })
  .catch(err => console.error('❌ Erro ao conectar:', err));
