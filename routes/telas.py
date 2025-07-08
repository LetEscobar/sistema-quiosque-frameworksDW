from flask import Blueprint, jsonify, request, render_template, session
from models import Tela, User, db
from decorators import login_required
from utils import registrar_acao
import re
from datetime import datetime

IP_REGEX = re.compile(r'^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')


telas_bp = Blueprint('telas', __name__, url_prefix='/api/telas')

@telas_bp.route('/dispositivos')
@login_required
def listar_dispositivos():
    return render_template('dispositivos.html')

@telas_bp.route('/', methods=['GET'])
def get_telas():
    db.session.expire_all()
    telas = Tela.query.order_by(Tela.idTela.desc()).all()
    telas_data = [{
        "id_tela": t.idTela,
        "nome_dispositivo": t.nomeDispositivo,
        "endereco_ip": t.enderecoIp,
        "status": t.status,
    } for t in telas]
    return jsonify(telas_data)

@telas_bp.route('/<int:id_tela>', methods=['GET'])
def get_tela(id_tela):
    tela = Tela.query.get_or_404(id_tela)
    return jsonify({
        "id_tela": tela.idTela,
        "nome_dispositivo": tela.nomeDispositivo,
        "endereco_ip": tela.enderecoIp,
        "status": tela.status
    })


@telas_bp.route('/', methods=['POST'])
def create_telas():
    data = request.json
    if not data or not all(k in data for k in ('nome_dispositivo', 'endereco_ip')):
        return jsonify({"error": "Dados incompletos"}), 400

    if not IP_REGEX.match(data['endereco_ip']):
        return jsonify({"error": "Endere\u00e7o IP inv\u00e1lido"}), 400
    
    try:
        nova_tela = Tela(
            nomeDispositivo=data['nome_dispositivo'],
            enderecoIp=data['endereco_ip'],
            status='Ativo'
        )
        db.session.add(nova_tela)
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> cadastrou o dispositivo <strong>{nova_tela.nomeDispositivo}</strong>")

        return jsonify({"message": "Tela criada com sucesso!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao salvar tela: {str(e)}"}), 500
    
@telas_bp.route('/<int:id_tela>', methods=['PUT'])
def update_tela(id_tela):
    tela = Tela.query.get_or_404(id_tela)
    data = request.json

    if not data or not all(k in data for k in ('nome_dispositivo', 'endereco_ip')):
        return jsonify({"error": "Dados incompletos"}), 400

    if not IP_REGEX.match(data['endereco_ip']):
        return jsonify({"error": "Endere\u00e7o IP inv\u00e1lido"}), 400

    tela.nomeDispositivo = data['nome_dispositivo']
    tela.enderecoIp = data['endereco_ip']

    try:
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> editou o dispositivo <strong>{tela.nomeDispositivo}</strong>")

        return jsonify({"message": "Dispositivo atualizado com sucesso!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar dispositivo: {str(e)}"}), 500


@telas_bp.route('/<int:id_tela>/status', methods=['PATCH'])
def toggle_tela_status(id_tela):
    tela = Tela.query.get_or_404(id_tela)
    data = request.json

    if 'status' not in data:
        return jsonify({"error": "Campo 'status' obrigatório"}), 400

    tela.status = data['status']

    try:
        db.session.commit()
        usuario = User.query.get(session.get("user_id"))
        registrar_acao(f"<strong>{usuario.name}</strong> marcou o dispositivo <strong>{tela.nomeDispositivo}</strong> como <strong>{tela.status}</strong>")

        return jsonify({"message": f"Status da tela atualizado para {tela.status}!"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar status: {str(e)}"}), 500

