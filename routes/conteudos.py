from flask import Blueprint, render_template, request, redirect, url_for
from decorators import login_required
from models import db, Conteudo, Tela, ConteudoDispositivo
import os, uuid
from werkzeug.utils import secure_filename

conteudos_bp = Blueprint('conteudos', __name__, url_prefix='/conteudos')

@conteudos_bp.route('/')
@login_required
def listar_conteudos():
    conteudos = Conteudo.query.order_by(Conteudo.id.desc()).all()
    dispositivos = Tela.query.all()
    return render_template('index.html', conteudos=conteudos, dispositivos=dispositivos)

@conteudos_bp.route('/adicionar', methods=['POST'])
@login_required
def adicionar_conteudo():
    nome = request.form['nome']
    dispositivos_ids = request.form.getlist('dispositivos')
    imagem = request.files.get('imagem')

    UPLOAD_FOLDER = os.path.join('static', 'uploads')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    if imagem and imagem.filename != '':
        filename = f"{uuid.uuid4().hex}_{secure_filename(imagem.filename)}"
        caminho = os.path.join(UPLOAD_FOLDER, filename)
        imagem.save(caminho)
        imagem_db = f'uploads/{filename}'
    else:
        imagem_db = None

    conteudo = Conteudo(nome=nome, imagem=imagem_db)
    db.session.add(conteudo)
    db.session.flush() 

    for disp_id in dispositivos_ids:
        rel = ConteudoDispositivo(conteudo_id=conteudo.id, dispositivo_id=int(disp_id))
        db.session.add(rel)

    db.session.commit()
    return redirect(url_for('conteudos.listar_conteudos'))


@conteudos_bp.route('/editar/<int:id>', methods=['POST'])
def editar_conteudo(id):
    conteudo = Conteudo.query.get(id)
    conteudo.nome = request.form['nome']
    novos_ids = set(map(int, request.form.getlist('dispositivos')))

    conteudo.dispositivos.clear()
    for disp_id in novos_ids:
        db.session.add(ConteudoDispositivo(conteudo_id=id, dispositivo_id=disp_id))

    db.session.commit()
    return redirect(url_for('conteudos.listar_conteudos'))

@conteudos_bp.route('/alternar_status/<int:id>')
def alternar_status_conteudo(id):
    conteudo = Conteudo.query.get(id)
    if not conteudo:
        return {'error': 'Conteúdo não encontrado'}, 404

    conteudo.status = 'Inativo' if conteudo.status == 'Ativo' else 'Ativo'
    db.session.commit()
    return {'status': conteudo.status}, 200


