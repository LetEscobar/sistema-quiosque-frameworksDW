# Sistema de Quiosque - Frameworks DW

Este projeto é um sistema web feito com **Flask** no backend e **SQLite** como banco de dados, com um painel administrativo que permite gerenciar usuários, campanhas, conteúdos e dispositivos que exibem esse conteúdo, em forma de quiosque.
O projeto está estruturado com **Blueprints Flask** e templates HTML organizados.

Siga os passos abaixo para configurar e rodar este projeto corretamente.

---

### ✅ 1. Clonar o repositório

Clone o repositório utilizando o comando

```bash
git clone https://github.com/LetEscobar/sistema-quiosque-frameworksDW.git
```

---

### ✅ 2. Criar um ambiente virtual

O ambiente virtual é importante para isolar as dependências do projeto e evitar conflitos com outras instalações do Python. Entre na pasta do projeto e crie o ambiente virtual.

```bash
python -m venv venv
```

---

### ✅ 3. Ativar o ambiente virtual

No **Linux/MacOS**:

```bash
source venv/bin/activate
```

No **Windows**:

```bash
venv\Scripts\activate
```

Depois de ativar, você verá o nome do ambiente (venv) aparecendo no início do terminal.

---

### ✅ 4. Instalar as dependências

Com o ambiente virtual ativado, instale todas as bibliotecas necessárias:

```bash
pip install -r requirements.txt
```

---

### ✅ 5. Verificar que tudo está instalado

Você pode verificar se as dependências foram instaladas corretamente:

```bash
pip freeze
```

---

### ✅ 6. Iniciar o servidor

Execute o comando:

```bash
python app.py
```

Acesse o sistema pelo navegador em:  
[http://127.0.0.1:2000](http://127.0.0.1:2000)

---

## 🖥️ Painel Administrativo – Visão Geral

### Tela de Login

-   Informe e-mail e senha cadastrados.
-   Apenas usuários com status **ativo** conseguem acessar.

---

### Funcionalidades disponíveis (usuários administradores):

#### 👤 Usuários

-   Criar, editar, ativar ou inativar usuários.
-   Só existe um usuário admin, os outros cadastrados tem acesso restrito.

#### 📺 Dispositivos

-   Cadastro com nome e endereço IP.
-   Status de conexão atualizado automaticamente via `/ping`.

#### 📄 Conteúdos

-   Upload de imagens.
-   Associação com campanhas e dispositivos.
-   Exibição controlada por data, status e vínculos.

#### 📢 Campanhas

-   Cadastro com título, cor de fundo e período de exibição.

#### 🕒 Histórico

-   Lista de ações realizadas no sistema: cadastros, edições, ativação/inativação, etc.

---

## 🔄 Comunicação com os Dispositivos

As TVs ou monitores acessam a rota `/api/quiosque-data` e:

1. Registram o check-in (atualizando status online).
2. Recebem os conteúdos vinculados ao IP.
3. Exibem somente se o conteúdo estiver **ativo**, **dentro do horário** e **associado ao dispositivo**.
