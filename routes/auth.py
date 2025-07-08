from datetime import datetime, timedelta
from flask_mail import Message
import re
import secrets
from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models import User, db
from utils import email_institucional_valido
from extensions import mail
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from models import TentativaLogin
from flask import request
from flask_mail import Message

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
            registrar_tentativa_login(email)
            flash("A senha precisa ter pelo menos 8 caracteres, 1 número e 1 caractere especial.")
            return redirect(url_for('auth.login_usuario'))
        
        user = User.query.filter_by(email=email).first()

        if not user:
            flash("Usuário não encontrado.")
            registrar_tentativa_login(email)
            return redirect(url_for('auth.login_usuario'))
                
        def registrar_tentativa_login(email):
            tentativa = TentativaLogin(email=email, ip=request.remote_addr)
            db.session.add(tentativa)
            db.session.commit()

            limite = datetime.utcnow() - timedelta(minutes=30)
            tentativas = TentativaLogin.query.filter(
                TentativaLogin.email == email,
                TentativaLogin.data_hora >= limite
            ).count()

            if tentativas >= 5:
                enviar_alerta_admin(email, tentativas)

        def enviar_alerta_admin(email_usuario, total_tentativas):
            admins = User.query.filter_by(is_admin=True).all()
            destinatarios = [admin.email for admin in admins if admin.status == 'Ativo']

            if not destinatarios:
                print("Nenhum administrador ativo encontrado para envio do alerta.")
                return

            msg = Message(
                subject="🔒 Alerta de tentativas de login suspeitas",
                recipients=destinatarios,
                body=f"""
                Foram detectadas {total_tentativas} tentativas de login malsucedidas nas últimas 30 minutos
                para o e-mail: {email_usuario}

                IP do último acesso: {request.remote_addr}
                """
            )
            try:
                mail.send(msg)
            except Exception as e:
                print(f"Erro ao enviar email de alerta: {e}")


        if user.status != 'Ativo':
            flash("Usuário inativo. Contate o administrador.")
            return redirect(url_for('auth.login_usuario'))

        if not check_password_hash(user.senha, password):
            flash("E-mail ou senha incorretos!")
            registrar_tentativa_login(email)
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

@auth_bp.route('/esqueci-senha', methods=['GET', 'POST'])
def esqueci_senha():
    if request.method == 'POST':
        email = request.form.get('email')
        user = User.query.filter_by(email=email).first()
        if user:
            token = secrets.token_urlsafe(32)
            user.reset_token = token
            user.reset_token_expira_em = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()

            link = url_for('auth.redefinir_senha', token=token, _external=True)
            msg = Message('Recuperação de senha - IF News', recipients=[email])
            msg.body = f"Olá {user.name},\n\nClique no link abaixo para redefinir sua senha:\n{link}\n\nEste link expira em 1 hora."

            try:
                mail.send(msg)
                flash('Se o e-mail estiver cadastrado, você receberá instruções.')
            except Exception as e:
                flash(f'Erro ao enviar e-mail: {str(e)}')
        else:
            flash('Se o e-mail estiver cadastrado, você receberá instruções.')
        return redirect(url_for('auth.login_usuario'))
    
    return render_template('esqueci_senha.html')

@auth_bp.route('/redefinir-senha/<token>', methods=['GET', 'POST'])
def redefinir_senha(token):
    user = User.query.filter_by(reset_token=token).first()
    if not user or user.reset_token_expira_em < datetime.utcnow():
        flash('Token inválido ou expirado.')
        return redirect(url_for('auth.login_usuario'))

    if request.method == 'POST':
        nova_senha = request.form.get('nova_senha')
        if len(nova_senha) < 8:
            flash("A senha precisa ter pelo menos 8 caracteres.")
            return redirect(request.url)

        user.senha = generate_password_hash(nova_senha)
        user.reset_token = None
        user.reset_token_expira_em = None
        db.session.commit()

        flash('Senha redefinida com sucesso!')
        return redirect(url_for('auth.login_usuario'))

    return render_template('redefinir_senha.html')
