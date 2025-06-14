from flask import Flask, render_template, request, jsonify
from models import db, User, Tela

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///painel.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/exibicao')
def exibir_quiosque():
    imagens = [
        'slide1.png',
        'slide2.png',
        'slide3.png'
    ]
    return render_template ('exibicao.html', image = imagens)

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
        "idTela": t.idTela,
        "nomeDispositivo": t.nomeDispositivo,
        "enderecoIp": t.enderecoIp,
        "status": t.status,
    } for t in telas]
    return jsonify(telas_data)


@app.route('/api/telas', methods=['POST'])
def create_telas():
    data = request.json
    if not data or not all(k in data for k in ('nomeDispositivo', 'enderecoIp')):
        return jsonify({"error": "Dados incompletos"}), 400
    
    try:
        nova_tela = Tela(
            nomeDispositivo=data['nomeDispositivo'],
            enderecoIp=data['enderecoIp'],
            status='Ativo'
        )
        db.session.add(nova_tela)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao salvar tela: {str(e)}"}), 500

    return jsonify({"message": "Tela criada com sucesso!"}), 201

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [{"id": u.id, "name": u.name, "email": u.email, "status": u.status, "senha": u.senha} for u in users]
    return jsonify(users_data)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    new_user = User(name=data['name'], email=data['email'], status='Ativo', senha=data['senha'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Usuário criado com sucesso!"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=2000)
