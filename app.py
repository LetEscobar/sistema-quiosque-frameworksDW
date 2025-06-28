from flask import Flask
from models import db
from routes import auth_bp, users_bp, telas_bp, main_bp, campanhas_bp
from config import Config
from routes.historico import historico_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(telas_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(campanhas_bp)
    app.register_blueprint(historico_bp)
    
    
    with app.app_context():
        db.create_all()
        from models import User
        import secrets
        if not User.query.filter_by(email='admin@estudante.ifms.edu.br').first():
            admin_user = User(
                name='Administrador',
                email='admin@estudante.ifms.edu.br',
                senha='Senha@123',
                status='Ativo',
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=2000)
