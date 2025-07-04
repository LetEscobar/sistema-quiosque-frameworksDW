from flask import Blueprint, jsonify, render_template, request
from models import Conteudo, ConteudoDispositivo, Tela, Campanha
from datetime import datetime
from sqlalchemy import and_, or_
from pytz import timezone


main_bp = Blueprint('main', __name__)

@main_bp.route('/api/quiosque-data')
def quiosque_data():
    agora = datetime.now(timezone("America/Campo_Grande"))

    
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

    # 👇 Adicione para forçar IP local em modo de teste
    if ip == '127.0.0.1':
        ip = '181.217.88.180'  # ou o IP da tela que você quer simular
    tela = Tela.query.filter_by(enderecoIp=ip, status='Ativo').first()

    if not tela:
        return jsonify({"background": "#FFFFFF", "imagens": []})

    conteudos = Conteudo.query \
        .join(ConteudoDispositivo, Conteudo.id == ConteudoDispositivo.conteudo_id) \
        .filter(
            Conteudo.status == 'Ativo',
            ConteudoDispositivo.dispositivo_id == tela.idTela,
            or_(Conteudo.data_inicio == None, Conteudo.data_inicio <= agora),
            or_(Conteudo.data_fim == None, Conteudo.data_fim >= agora)
        ).all()

    imagens = [c.imagem for c in conteudos if c.imagem]

    campanha = Campanha.query.filter(
        Campanha.status == 'Ativo',
        Campanha.inicio <= agora,
        or_(Campanha.fim == None, Campanha.fim >= agora)
    ).order_by(Campanha.inicio.desc()).first()

    cor = campanha.cor if campanha else "#FFFFFF"

    return jsonify({"background": cor, "imagens": imagens})

@main_bp.route('/quiosque')
def exibir_quiosque():
    fuso_ms = timezone("America/Campo_Grande")
    agora = datetime.now(fuso_ms)

    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

    # 👇 Adicione para forçar IP local em modo de teste
    if ip == '127.0.0.1':
        ip = '181.217.88.180'  # ou o IP da tela que você quer simular

    tela = Tela.query.filter_by(enderecoIp=ip, status='Ativo').first()

    if not tela:
        return render_template("quiosque.html", imagens=[], background="#FFFFFF")

    conteudos_validos = Conteudo.query \
        .join(ConteudoDispositivo, Conteudo.id == ConteudoDispositivo.conteudo_id) \
        .filter(
            Conteudo.status == 'Ativo',
            ConteudoDispositivo.dispositivo_id == tela.idTela,
            or_(Conteudo.data_inicio == None, Conteudo.data_inicio <= agora),
            or_(Conteudo.data_fim == None, Conteudo.data_fim >= agora),
        ).all()

    imagens = [c.imagem for c in conteudos_validos if c.imagem]

    campanha_ativa = Campanha.query.filter(
        Campanha.status == 'Ativo',
        Campanha.inicio <= agora,
        or_(Campanha.fim == None, Campanha.fim >= agora)
    ).order_by(Campanha.inicio.desc()).first()

    cor_background = campanha_ativa.cor if campanha_ativa else "#FFFFFF"

    return render_template("quiosque.html", imagens=imagens, background=cor_background)
