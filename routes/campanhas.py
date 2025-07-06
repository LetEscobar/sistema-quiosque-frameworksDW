from flask import Blueprint, render_template, request, jsonify, session
from models import User, db, Campanha
from decorators import login_required, admin_required
from datetime import datetime
from utils import registrar_acao
from pytz import timezone
fuso = timezone("America/Campo_Grande")


campanhas_bp = Blueprint('campanhas', __name__, url_prefix='/api/campanhas')

@campanhas_bp.route('/list', methods=['GET'])
@login_required
def listar_campanhas():
    campanhas = Campanha.query.order_by(Campanha.id.desc()).all()
    return render_template('campanhas.html', campanhas=campanhas)

@campanhas_bp.route('/', methods=['GET'])
def get_campanhas():
    campanhas = Campanha.query.order_by(Campanha.id.desc()).all()
    return jsonify([{
        "id": c.id,
        "titulo": c.titulo,
        "cor": c.cor,
        "status": c.status,
        "inicio": c.inicio.isoformat(timespec='minutes') if c.inicio else None,
        "fim": c.fim.isoformat(timespec='minutes') if c.fim else None,
    } for c in campanhas])

@campanhas_bp.route('/', methods=['POST'])
def create_campanha():
    data = request.json
    required = ['titulo', 'cor', 'inicio', 'fim']
    for campo in required:
        if not data.get(campo):
            return jsonify({"error": f"Campo '{campo}' obrigat\u00f3rio."}), 400
    try:
        inicio = fuso.localize(datetime.fromisoformat(data['inicio']))
        fim = fuso.localize(datetime.fromisoformat(data['fim']))

        nova = Campanha(
            titulo=data['titulo'],
            cor=data['cor'],
            status='Ativo',
            inicio=inicio,
            fim=fim
        )
        db.session.add(nova)
        db.session.commit()
        
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> cadastrou a campanha <strong>{nova.titulo}</strong>")
        
        return jsonify({"message": "Campanha criada com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        print("Erro ao criar campanha:", e)  # imprime no terminal
        return jsonify({"error": str(e)}), 500

@campanhas_bp.route('/<int:id>', methods=['GET'])
def get_campanha(id):
    campanha = Campanha.query.get_or_404(id)
    return jsonify({
        "id": campanha.id,
        "titulo": campanha.titulo,
        "cor": campanha.cor,
        "status": campanha.status,
        "inicio": campanha.inicio.isoformat(timespec='minutes') if campanha.inicio else None,
        "fim": campanha.fim.isoformat(timespec='minutes') if campanha.fim else None,
    })

@campanhas_bp.route('/<int:id>', methods=['PUT'])
def update_campanha(id):
    campanha = Campanha.query.get_or_404(id)
    data = request.json
    required = ['titulo', 'cor', 'inicio', 'fim']
    for campo in required:
        if not data.get(campo):
            return jsonify({"error": f"Campo '{campo}' obrigat\u00f3rio."}), 400

    campanha.titulo = data['titulo']
    campanha.cor = data['cor']
    try:
        campanha.inicio = fuso.localize(datetime.fromisoformat(data['inicio']))
        campanha.fim = fuso.localize(datetime.fromisoformat(data['fim']))

        
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> editou a campanha <strong>{campanha.titulo}</strong>")
        
        return jsonify({"message": "Campanha atualizada com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@campanhas_bp.route('/<int:id>/status', methods=['PATCH'])
def toggle_campanha_status(id):
    campanha = Campanha.query.get_or_404(id)
    data = request.json
    if 'status' not in data:
        return jsonify({"error": "Campo 'status' obrigatório."}), 400
    campanha.status = data['status']
    try:
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> marcou a campanha <strong>{campanha.titulo}</strong> como {campanha.status}")
        return jsonify({"message": f"Status atualizado para {campanha.status}"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
