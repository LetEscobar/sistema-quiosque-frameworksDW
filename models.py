from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    acao = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    status = db.Column(db.String(10), nullable=False, default='Ativo')
    senha = db.Column(db.String(100), nullable=False)
    logUser = db.relationship('Log', backref=db.backref('user'))
    is_admin = db.Column(db.Boolean, default=False)
    
    @property
    def is_active(self):
        return self.status == 'Ativo'
    
class Tela(db.Model):
    idTela = db.Column(db.Integer, primary_key=True)
    nomeDispositivo = db.Column(db.String(20), nullable=False)
    enderecoIp = db.Column(db.String(15), nullable=False, unique=True)
    status = db.Column(db.String(10), nullable=False, default='Ativo')

class Programacao(db.Model):
    idProgramacao = db.Column(db.Integer, primary_key=True)
    dataInicio = db.Column(db.Date, nullable=False)
    dataFim = db.Column(db.Date, nullable=False)
    horaInicio = db.Column(db.Time, nullable=False)
    horaFim = db.Column(db.Time, nullable=False)
    diaSemana = db.Column(db.String(10), nullable=False)

    idTela = db.Column(db.Integer, db.ForeignKey('tela.idTela'), nullable=False)
    tela = db.relationship('Tela', backref='programacoes')

    idConteudo = db.Column(db.Integer, db.ForeignKey('conteudo.id'), nullable=False)
    conteudo = db.relationship('Conteudo', backref='programacoes')

    
class Campanha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    cor = db.Column(db.String(7), nullable=False, default="#FFFFFF")
    status = db.Column(db.String(10), nullable=False, default="Ativo")
    inicio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fim = db.Column(db.DateTime, nullable=True)

class Historico(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    acao = db.Column(db.String(255), nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    usuario = db.relationship('User', backref='historicos')


class Conteudo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    imagem = db.Column(db.String(200)) 
    status = db.Column(db.String(20), default='Ativo')

    dispositivos = db.relationship('ConteudoDispositivo', back_populates='conteudo', cascade='all, delete-orphan')

class ConteudoDispositivo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conteudo_id = db.Column(db.Integer, db.ForeignKey('conteudo.id'))
    dispositivo_id = db.Column(db.Integer, db.ForeignKey('tela.idTela'))

    conteudo = db.relationship('Conteudo', back_populates='dispositivos')
    dispositivo = db.relationship('Tela')