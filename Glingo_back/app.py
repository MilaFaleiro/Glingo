from flask import Flask
from flask_cors import CORS
from rotas.alunos import alunos_bp
from rotas.turmas import turmas_bp
from rotas.matriculas import matriculas_bp
from rotas.atendimentos import atendimentos_bp
from rotas.professores import professores_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(alunos_bp)
app.register_blueprint(turmas_bp)
app.register_blueprint(matriculas_bp)
app.register_blueprint(atendimentos_bp)
app.register_blueprint(professores_bp)

@app.route('/')
def index():
    return {"mensagem": "API Glingo rodando!"}

if __name__ == '__main__':
    app.run(debug=True)