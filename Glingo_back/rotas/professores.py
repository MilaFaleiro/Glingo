# Rotas de Professores

from flask import Blueprint, request, jsonify
from banco.conexao import conectar
import hashlib

professores_bp = Blueprint('professores', __name__)

def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()


# POST /professores - Cadastra um novo professor
@professores_bp.route('/professores', methods=['POST'])
def cadastrar_professor():
    dados = request.get_json()

    campos = ['nome', 'email', 'senha', 'ra']
    for campo in campos:
        if campo not in dados:
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400

    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO professor (nome, email, senha, ra, telefone, especialidade)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            dados['nome'],
            dados['email'],
            hash_senha(dados['senha']),
            dados['ra'],
            dados.get('telefone', ''),
            dados.get('especialidade', '')
        ))
        conn.commit()
        novo_id = cursor.lastrowid
        return jsonify({"mensagem": "Professor cadastrado com sucesso!", "id": novo_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# POST /professores/login - Login do professor
@professores_bp.route('/professores/login', methods=['POST'])
def login_professor():
    dados = request.get_json()
    email = dados.get('email')
    senha = dados.get('senha')

    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, nome, email, ra, especialidade FROM professor WHERE email = %s AND senha = %s",
        (email, hash_senha(senha))
    )
    professor = cursor.fetchone()
    cursor.close()
    conn.close()

    if professor:
        return jsonify({"mensagem": "Login realizado com sucesso!", "professor": professor})
    return jsonify({"erro": "Email ou senha incorretos"}), 401


# GET /professores - Lista todos os professores
@professores_bp.route('/professores', methods=['GET'])
def listar_professores():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, email, ra, telefone, especialidade, created_at FROM professor")
    professores = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(professores)
