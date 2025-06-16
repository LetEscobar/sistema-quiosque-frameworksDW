from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    status = db.Column(db.String(10), nullable=False, default='Ativo')
    senha = db.Column(db.String(100), nullable=False)
    logUser = db.relationship('Log', backref=db.backref('user'))
    
class Tela(db.Model):
    idTela = db.Column(db.Integer, primary_key=True)
    nomeDispositivo = db.Column(db.String(20), nullable=False)
    enderecoIp = db.Column(db.String(15), nullable=False, unique=True)
    status = db.Column(db.String(10), nullable=False, default='Ativo')
    
class Conteudo(db.Model):
    idConteudo = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    caminhoArquivo = db.Column(db.String(100), nullable=False)
    dataArquivo = db.Column(db.Date, nullable=False)
    duracao = db.Column(db.Integer, nullable=False)
    cor = db.Column(db.String(20), nullable=True)

class Programacao(db.Model):
    idProgramacao = db.Column(db.Integer, primary_key=True)
    dataInicio = db.Column(db.Date, nullable=False)
    dataFim = db.Column(db.Date, nullable=False)
    horaInicio = db.Column(db.Time, nullable=False)
    horaFim = db.Column(db.Time, nullable=False)
    diaSemana = db.Column(db.String(10), nullable=False) 
    tela = db.relationship('Tela', backref='programacoes')
    idTela = db.Column(db.Integer, db.ForeignKey('tela.idTela'), nullable=False)
    conteudo = db.relationship('Conteudo', backref='programacoes')
    idConteudo = db.Column(db.Integer, db.ForeignKey('conteudo.idConteudo'), nullable=False)

class Horario(db.Model):
    idHorario = db.Column(db.Integer, primary_key=True)
    diaSemana = db.Column(db.String(10), nullable=False)
    sala = db.Column(db.String(20), nullable=False)
    turma = db.Column(db.String(20), nullable=False)
    hora = db.Column(db.Time, nullable=False)
    conteudo = db.relationship('Conteudo', backref='horarios')
    idConteudo = db.Column(db.Integer, db.ForeignKey('conteudo.idConteudo'), nullable=False)
    programacao = db.relationship('Programacao', backref='horarios')
    idProgramacao = db.Column(db.Integer, db.ForeignKey('programacao.idProgramacao'), nullable=False)

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    acao = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
