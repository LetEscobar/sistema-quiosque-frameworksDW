from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from models import db, User, Tela
import os, glob, secrets, re

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///painel.db'
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
    return render_template('login.html')

@app.route('/quiosque')
def exibir_quiosque():
    img_dir = os.path.join(app.static_folder, "image")
    extensoes = ("*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp")

    imagens = []
    for ext in extensoes:
        imagens.extend(
            os.path.basename(p)
            for p in glob.glob(os.path.join(img_dir, ext))
        )
        
    return render_template("quiosque.html", imagens=imagens)

@app.route('/usuarios')
def listar_usuarios():
    return render_template('usuarios.html')

@app.route('/dispositivos')
def listar_dispositivos():
    return render_template('dispositivos.html')

@app.route('/api/telas', methods=['GET'])
def get_telas():
    telas = Tela.query.all()
    telas_data = [{
        "id_tela": t.idTela,
        "nome_dispositivo": t.nomeDispositivo,
        "endereco_ip": t.enderecoIp,
        "status": t.status,
    } for t in telas]
    return jsonify(telas_data)

@app.route('/api/telas', methods=['POST'])
def create_telas():
    data = request.json
    if not data or not all(k in data for k in ('nome_dispositivo', 'endereco_ip')):
        return jsonify({"error": "Dados incompletos"}), 400
    
    try:
        nova_tela = Tela(
            nomeDispositivo=data['nome_dispositivo'],
            enderecoIp=data['endereco_ip'],
            status='Ativo'
        )
        db.session.add(nova_tela)
        db.session.commit()
        return jsonify({"message": "Tela criada com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao salvar tela: {str(e)}"}), 500


@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "status": u.status,
        "senha": u.senha  # remover depois
    } for u in users]
    return jsonify(users_data)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "status": user.status
    })

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    try:
        new_user = User(
            name=data['name'],
            email=data['email'],
            senha=data['senha'],
            status='Ativo'
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuário criado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao criar usuário: {str(e)}"}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)

    if 'senha' in data and data['senha'].strip():
        user.senha = data['senha']

    try:
        db.session.commit()
        return jsonify({"message": "Usuário atualizado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar usuário: {str(e)}"}), 500

@app.route('/api/users/<int:user_id>/status', methods=['PATCH'])
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    if 'status' not in data:
        return jsonify({"error": "Campo 'status' obrigatório"}), 400

    user.status = data['status']
    try:
        db.session.commit()
        return jsonify({"message": f"Status do usuário atualizado para {user.status}!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar status: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=2000)
