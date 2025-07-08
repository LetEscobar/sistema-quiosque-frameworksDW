from flask import Blueprint, render_template
from decorators import admin_required, login_required
from models import db, Historico
from timezone import para_fuso_local 

historico_bp = Blueprint('historico', __name__)

@historico_bp.route('/historico')
@login_required
@admin_required
def listar_historico():
    registros = Historico.query.order_by(Historico.data.desc()).all()

    for r in registros:
        r.data_local = para_fuso_local(r.data)

    return render_template('historico.html', historico=registros)
