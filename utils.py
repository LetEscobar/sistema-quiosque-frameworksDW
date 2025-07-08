import re
from models import db, Historico
from flask import session
from datetime import datetime, timedelta

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
    
def is_checkin_recente(ultimo_checkin, minutos=5):
    if not ultimo_checkin:
        return False
    return datetime.utcnow() - ultimo_checkin <= timedelta(minutes=minutos)