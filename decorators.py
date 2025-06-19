from functools import wraps
from flask import session, redirect, url_for, flash
from models import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Você precisa estar logado para acessar essa página.')
            return redirect(url_for('auth.login_usuario'))
        
        user = User.query.get(session['user_id'])
        if not user or user.status != 'Ativo':
            session.clear()
            flash('Sua conta está inativa ou inválida. Faça login novamente.')
            return redirect(url_for('auth.login_usuario'))
        
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            flash('Acesso restrito ao administrador.')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function
