from flask import Blueprint, render_template
from decorators import login_required
from models import db, Historico

historico_bp = Blueprint('historico', __name__)

@historico_bp.route('/historico')
@login_required
def listar_historico():
    registros = Historico.query.order_by(Historico.data.desc()).all()
    return render_template('historico.html', historico=registros)
