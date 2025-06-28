import re
from models import db, Historico
from flask import session

def email_institucional_valido(email):
    padrao = r"^[\w\.-]+@(estudante\.)?ifms\.edu\.br$"
    return bool(re.match(padrao, email))

def registrar_acao(acao):
    historico = Historico(
        acao=acao,
        usuario_id=session.get("user_id")
    )
    db.session.add(historico)
    db.session.commit()