import re

def email_institucional_valido(email):
    padrao = r"^[\w\.-]+@(estudante\.)?ifms\.edu\.br$"
    return bool(re.match(padrao, email))
