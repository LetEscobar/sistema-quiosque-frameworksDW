import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'chave-padrao')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///painel.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
