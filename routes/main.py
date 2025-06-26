from flask import Blueprint, render_template, session
from decorators import login_required
import os, glob

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@login_required
def index():
    return render_template('index.html')

@main_bp.route('/quiosque')
def exibir_quiosque():
    img_dir = os.path.join('static', "image")
    extensoes = ("*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp")

    imagens = []
    for ext in extensoes:
        imagens.extend(
            os.path.basename(p)
            for p in glob.glob(os.path.join(img_dir, ext))
        )
        
    return render_template("quiosque.html", imagens=imagens)
