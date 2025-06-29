import re
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models import User
from utils import email_institucional_valido

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login_usuario():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email_institucional_valido(email):
            flash("E-mail ou senha incorretos!")
            return redirect(url_for('auth.login_usuario'))

        if len(password) < 8 or not re.search(r"\d", password) or not re.search(r"\W", password):
            flash("A senha precisa ter pelo menos 8 caracteres, 1 número e 1 caractere especial.")
            return redirect(url_for('auth.login_usuario'))
        
        user = User.query.filter_by(email=email).first()

        if not user:
            flash("Usuário não encontrado.")
            return redirect(url_for('auth.login_usuario'))

        if user.status != 'Ativo':
            flash("Usuário inativo. Contate o administrador.")
            return redirect(url_for('auth.login_usuario'))

        if user.senha != password:
            flash("E-mail ou senha incorretos!")
            return redirect(url_for('auth.login_usuario'))
        
        session['user_id'] = user.id
        session['user_name'] = user.name
        session['is_admin'] = user.is_admin
        flash(f"Bem-vindo, {user.name}!")
        return redirect(url_for('conteudos.listar_conteudos'))

    return render_template('login.html')

@auth_bp.route('/auth.logout')
def logout():
    session.clear()
    flash('Você saiu do sistema.')
    return redirect(url_for('auth.login_usuario'))
