from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from models import db, User
import secrets
import re

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

def email_institucional_valido(email):
    padrao = r"^[\w\.-]+@estudante\.ifms\.edu\.br$"
    return bool(re.match(padrao, email))

@app.route('/login', methods=['GET', 'POST'])
def login_usuario():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        if not email_institucional_valido(email):
            flash("Use um email institucional do IFMS (ex: nome@estudante.ifms.edu.br).")
            return redirect(url_for('login_usuario'))

        if len(password) < 8 or not re.search(r"\d", password) or not re.search(r"\W", password):
            flash("A senha precisa ter pelo menos 8 caracteres, 1 número e 1 caractere especial.")
            return redirect(url_for('login_usuario'))
        
        user = User.query.filter_by(email=email).first()

        if not user:
            flash("Usuário não encontrado.")
            return redirect(url_for('login_usuario'))

        if user.senha != password:
            flash("Senha incorreta.")
            return redirect(url_for('index'))
        
        flash(f"Bem-vindo, {user.name}!")
        return redirect(url_for('listar_usuarios'))

    print("funcionando!")
    return render_template('tela-login.html')

@app.route('/usuarios')
def listar_usuarios():
    return render_template('usuarios.html')

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [{"id": u.id, "name": u.name, "email": u.email, "status": u.status} for u in users]
    return jsonify(users_data)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(name=data['name'], email=data['email'], status='Ativo')
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuário criado com sucesso!"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=2000)
