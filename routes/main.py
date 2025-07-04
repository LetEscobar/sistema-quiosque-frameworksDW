from flask import Blueprint, render_template
from models import Conteudo  # ✅ certifique-se de importar
from decorators import login_required

main_bp = Blueprint('main', __name__)

@main_bp.route('/quiosque')
def exibir_quiosque():
    conteudos_ativos = Conteudo.query.filter_by(status='Ativo').all()
    imagens = [conteudo.imagem for conteudo in conteudos_ativos if conteudo.imagem]

    return render_template("quiosque.html", imagens=imagens)
