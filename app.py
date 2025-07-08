from flask import Flask, redirect, url_for
from extensions import db, mail
import secrets
from models import User
from routes import auth_bp, users_bp, telas_bp, main_bp, campanhas_bp, conteudos_bp
from routes.historico import historico_bp
from config import Config
from werkzeug.security import generate_password_hash


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = 'if.news.tads@gmail.com'
    app.config['MAIL_PASSWORD'] = 'pjfw hgov ntax zxov'
    app.config['MAIL_DEFAULT_SENDER'] = 'if.news.tads@gmail.com'
    
    mail.init_app(app)
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(telas_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(campanhas_bp)
    app.register_blueprint(historico_bp)
    app.register_blueprint(conteudos_bp)

    @app.route('/')
    def index():
        return redirect(url_for('auth.login_usuario'))
    
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email='leticia.araujo@estudante.ifms.edu.br').first():
            admin_user = User(
                name='Administrador',
                email='leticia.araujo@estudante.ifms.edu.br',
                senha=generate_password_hash('Senha@123'),
                status='Ativo',
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=2000)
