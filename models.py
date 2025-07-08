from datetime import datetime
from extensions import db

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
    logs = db.relationship('Log', backref=db.backref('user'))
    is_admin = db.Column(db.Boolean, default=False)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expira_em = db.Column(db.DateTime, nullable=True)
    
    @property
    def is_active(self):
        return self.status == 'Ativo'
    
class Tela(db.Model):
    id_tela = db.Column('idTela', db.Integer, primary_key=True)
    nome_dispositivo = db.Column('nomeDispositivo', db.String(20), nullable=False)
    endereco_ip = db.Column('enderecoIp', db.String(15), nullable=False, unique=True)
    status = db.Column(db.String(10), nullable=False, default='Ativo')
    ultimo_checkin = db.Column(db.DateTime)

class Programacao(db.Model):
    id_programacao = db.Column('idProgramacao', db.Integer, primary_key=True)
    data_inicio = db.Column('dataInicio', db.Date, nullable=False)
    data_fim = db.Column('dataFim', db.Date, nullable=False)
    hora_inicio = db.Column('horaInicio', db.Time, nullable=False)
    hora_fim = db.Column('horaFim', db.Time, nullable=False)
    dia_semana = db.Column('diaSemana', db.String(10), nullable=False)

    id_tela = db.Column('idTela', db.Integer, db.ForeignKey('tela.idTela'), nullable=False)
    tela = db.relationship('Tela', backref='programacoes')

    id_conteudo = db.Column('idConteudo', db.Integer, db.ForeignKey('conteudo.id'), nullable=False)
    conteudo = db.relationship('Conteudo', backref='programacoes')

    
class Campanha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    cor = db.Column(db.String(7), nullable=False, default="#369931")
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
    
    data_inicio = db.Column(db.DateTime, nullable=True)
    data_fim = db.Column(db.DateTime, nullable=True)

    dispositivos = db.relationship('ConteudoDispositivo', back_populates='conteudo', cascade='all, delete-orphan')


class ConteudoDispositivo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conteudo_id = db.Column(db.Integer, db.ForeignKey('conteudo.id'))
    dispositivo_id = db.Column(db.Integer, db.ForeignKey('tela.idTela'))

    conteudo = db.relationship('Conteudo', back_populates='dispositivos')
    dispositivo = db.relationship('Tela')
    
class TentativaLogin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    data_hora = db.Column(db.DateTime, default=datetime.utcnow)
    ip = db.Column(db.String(100))
