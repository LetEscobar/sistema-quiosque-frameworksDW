from datetime import datetime
from flask import Blueprint, jsonify, render_template, request, redirect, url_for, session
from decorators import login_required
from models import db, Conteudo, Tela, ConteudoDispositivo, User
import os, uuid
from werkzeug.utils import secure_filename
from utils import registrar_acao, is_checkin_recente

conteudos_bp = Blueprint('conteudos', __name__,url_prefix='/conteudos')

@conteudos_bp.route('/')
@login_required
def listar_conteudos():
    conteudos = Conteudo.query.order_by(Conteudo.id.desc()).all()
    
    dispositivos = Tela.query.order_by(Tela.nome_dispositivo).all()

    for dispositivo in dispositivos:
        ativo = dispositivo.status == 'Ativo'
        online = is_checkin_recente(dispositivo.ultimo_checkin)
        dispositivo.online = ativo and online
        
    return render_template('index.html', conteudos=conteudos, dispositivos=dispositivos)

@conteudos_bp.route('/adicionar', methods=['POST'])
@login_required
def adicionar_conteudo():
    nome = request.form['nome']
    dispositivos_ids = request.form.getlist('dispositivos')
    imagem = request.files.get('imagem')
    
    data_inicio = request.form.get('data_inicio') or None
    data_fim = request.form.get('data_fim') or None

    if not nome or not data_inicio or not data_fim or not dispositivos_ids:
        return redirect(url_for('conteudos.listar_conteudos'))
    
    data_inicio = datetime.fromisoformat(data_inicio) if data_inicio else None
    data_fim = datetime.fromisoformat(data_fim) if data_fim else None

    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    if imagem and imagem.filename != '':
        filename = f"{uuid.uuid4().hex}_{secure_filename(imagem.filename)}"
        caminho = os.path.join(UPLOAD_FOLDER, filename)
        imagem.save(caminho)
        imagem_db = f'uploads/{filename}'
    else:
        imagem_db = None

    conteudo = Conteudo(nome=nome, imagem=imagem_db, data_inicio=data_inicio, data_fim=data_fim)
    db.session.add(conteudo)
    db.session.flush() 

    for disp_id in dispositivos_ids:
        rel = ConteudoDispositivo(conteudo_id=conteudo.id, dispositivo_id=int(disp_id))
        db.session.add(rel)
    
    db.session.commit()
    
    usuario = User.query.get(session.get("user_id"))
    registrar_acao(f"<strong>{usuario.name}</strong> cadastrou o conteúdo <strong>{conteudo.nome}</strong>")

    return redirect(url_for('conteudos.listar_conteudos'))


@conteudos_bp.route('/editar/<int:id>', methods=['POST'])
def editar_conteudo(id):
    conteudo = Conteudo.query.get(id)
    if not conteudo:
        return jsonify({'error': 'Conteúdo não encontrado'}), 404

    data = request.get_json()
    nome = data.get('nome')
    dispositivos = data.get('dispositivos', [])
    data_inicio_str = data.get('data_inicio')
    data_fim_str = data.get('data_fim')

    if not nome or not data_inicio_str or not data_fim_str or not dispositivos:
        return jsonify({'error': 'Campos obrigatórios ausentes'}), 400

    conteudo.nome = nome
    conteudo.data_inicio = datetime.fromisoformat(data_inicio_str)
    conteudo.data_fim = datetime.fromisoformat(data_fim_str)

    ConteudoDispositivo.query.filter_by(conteudo_id=id).delete()

    for disp_id in map(int, dispositivos):
        db.session.add(ConteudoDispositivo(conteudo_id=id, dispositivo_id=disp_id))

    db.session.commit()

    usuario = User.query.get(session.get("user_id"))
    registrar_acao(f"<strong>{usuario.name}</strong> editou o conteúdo <strong>{conteudo.nome}</strong>")

    return jsonify({'success': True})


@conteudos_bp.route('/alternar_status/<int:id>', methods=['PATCH'])
def alternar_status_conteudo(id):
    conteudo = Conteudo.query.get(id)
    if not conteudo:
        return jsonify({'error': 'Conteúdo não encontrado'}), 404

    conteudo.status = 'Inativo' if conteudo.status == 'Ativo' else 'Ativo'
    db.session.commit()
    
    usuario = User.query.get(session.get("user_id"))
    registrar_acao(f"<strong>{usuario.name}</strong> marcou o conteúdo <strong>{conteudo.nome}</strong> como {conteudo.status}")

    return jsonify({'status': conteudo.status}), 200

@conteudos_bp.route('/api/<int:id>')
def get_conteudo(id):
    conteudo = Conteudo.query.get(id)
    if not conteudo:
        return jsonify({'error': 'Conteúdo não encontrado'}), 404

    return jsonify({
        'id': conteudo.id,
        'nome': conteudo.nome,
        'dispositivos': [rel.dispositivo_id for rel in conteudo.dispositivos],
        'data_inicio': conteudo.data_inicio.isoformat() if conteudo.data_inicio else '',
        'data_fim': conteudo.data_fim.isoformat() if conteudo.data_fim else ''
    })

@conteudos_bp.route('/ping', methods=['POST'])
def checkin_dispositivo():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

    tela = Tela.query.filter_by(endereco_ip=ip).first()

    if not tela:
        return jsonify({'error': 'Dispositivo não registrado'}), 404

    tela.ultimo_checkin = datetime.utcnow()
    db.session.commit()

    return jsonify({'status': 'Check-in registrado', 'nome': tela.nome_dispositivo})
