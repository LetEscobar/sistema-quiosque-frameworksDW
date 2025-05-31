from flask import Flask, render_template, request, jsonify
from models import db, User
import models

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

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
