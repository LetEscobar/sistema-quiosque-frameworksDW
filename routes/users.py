from flask import Blueprint, render_template, session, jsonify, request
from models import User, db
from decorators import login_required, admin_required
from flask import current_app as app
from utils import registrar_acao


from utils import email_institucional_valido

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/list', methods=['GET'])
@login_required
@admin_required
def listar_usuarios():
    users = User.query.order_by(User.id.desc()).all()
    return render_template('usuarios.html', users=users, current_user_id=session.get('user_id'))

@users_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.order_by(User.id.desc()).all()
    users_data = [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "status": u.status,
        "senha": u.senha  # cuidado: remover depois
    } for u in users]
    return jsonify(users_data)

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "status": user.status
    })

@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    email = data.get('email')

    if not email_institucional_valido(email):
        return jsonify({"error": "E-mail institucional inválido."}), 400

    try:
        new_user = User(
            name=data['name'],
            email=email,
            senha=data['senha'],
            status='Ativo'
        )
        db.session.add(new_user)
        db.session.commit()
        
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> cadastrou o usuário <strong>{new_user.name}</strong>")
        
        return jsonify({"message": "Usuário criado com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao criar usuário: {str(e)}"}), 500
    
@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    email = data.get('email', user.email)

    if not email_institucional_valido(email):
        return jsonify({"error": "E-mail institucional inválido."}), 400

    user.name = data.get('name', user.name)
    user.email = email

    if 'senha' in data and data['senha'].strip():
        user.senha = data['senha']

    try:
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> editou o usuário <strong>{user.name}</strong>")
        return jsonify({"message": "Usuário atualizado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar usuário: {str(e)}"}), 500

@users_bp.route('/<int:user_id>/status', methods=['PATCH'])
def toggle_user_status(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    if 'status' not in data:
        return jsonify({"error": "Campo 'status' obrigatório"}), 400

    if session.get('user_id') == user.id and user.is_admin:
        return jsonify({"error": "Você não pode desativar sua própria conta de administrador."}), 403

    user.status = data['status']
    try:
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> marcou o usuário <strong>{user.name}</strong> como {user.status}")
        return jsonify({"message": f"Status do usuário atualizado para {user.status}!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar status: {str(e)}"}), 500
