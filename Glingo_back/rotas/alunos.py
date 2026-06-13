# Rotas de Alunos

from flask import Blueprint, request, jsonify
from banco.conexao import conectar
import hashlib

alunos_bp = Blueprint('alunos', __name__)

def hash_senha(senha):
    return hashlib.sha256(senha.encode()).hexdigest()


# GET /alunos - Lista todos os alunos
@alunos_bp.route('/alunos', methods=['GET'])
def listar_alunos():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, email, telefone, cpf, data_nasc, created_at FROM aluno")
    alunos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(alunos)


# GET /alunos/<id> - Busca um aluno pelo ID
@alunos_bp.route('/alunos/<int:id>', methods=['GET'])
def buscar_aluno(id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, cpf, email, telefone, data_nasc FROM aluno WHERE id = %s", (id,))
    aluno = cursor.fetchone()
    cursor.close()
    conn.close()
    if aluno:
        return jsonify(aluno)
    return jsonify({"erro": "Aluno não encontrado"}), 404


# POST /alunos - Cadastra um novo aluno (com hash de senha)
@alunos_bp.route('/alunos', methods=['POST'])
def cadastrar_aluno():
    dados = request.get_json()
    campos = ['nome', 'cpf', 'email', 'senha', 'telefone']
    for campo in campos:
        if campo not in dados:
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400

    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO aluno (nome, cpf, email, senha, telefone, data_nasc)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            dados['nome'], dados['cpf'], dados['email'],
            hash_senha(dados['senha']), dados['telefone'], dados.get('data_nasc')
        ))
        conn.commit()
        novo_id = cursor.lastrowid

        # Envia mensagem de boas-vindas no atendimento
        cursor.execute("""
            INSERT INTO atendimento (aluno_id, tipo, descricao)
            VALUES (%s, %s, %s)
        """, (novo_id, 'Boas-vindas', 'Conta criada com sucesso'))
        conn.commit()
        at_id = cursor.lastrowid
        cursor.execute("""
            INSERT INTO mensagem (atendimento_id, remetente, conteudo)
            VALUES (%s, %s, %s)
        """, (at_id, 'admin', f"Olá, {dados['nome']}! 🎉 Seja bem-vindo(a) à Glingo! Sua conta foi criada com sucesso. Explore nossas turmas e inicie sua jornada no aprendizado de idiomas. Qualquer dúvida, estamos aqui!"))
        conn.commit()

        return jsonify({"mensagem": "Aluno cadastrado com sucesso!", "id": novo_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# PUT /alunos/<id> - Atualiza dados do aluno
@alunos_bp.route('/alunos/<int:id>', methods=['PUT'])
def atualizar_aluno(id):
    dados = request.get_json()
    conn = conectar()
    cursor = conn.cursor()
    try:
        campos = []
        valores = []
        if 'nome' in dados:
            campos.append("nome = %s"); valores.append(dados['nome'])
        if 'telefone' in dados:
            campos.append("telefone = %s"); valores.append(dados['telefone'])
        if 'senha' in dados and dados['senha']:
            campos.append("senha = %s"); valores.append(hash_senha(dados['senha']))
        if not campos:
            return jsonify({"erro": "Nenhum campo para atualizar"}), 400
        valores.append(id)
        cursor.execute(f"UPDATE aluno SET {', '.join(campos)} WHERE id = %s", valores)
        conn.commit()
        return jsonify({"mensagem": "Dados atualizados com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# POST /login - Login do aluno
@alunos_bp.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get('email')
    senha = dados.get('senha')
    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, nome, email, telefone, cpf FROM aluno WHERE email = %s AND senha = %s",
        (email, hash_senha(senha))
    )
    aluno = cursor.fetchone()
    cursor.close()
    conn.close()
    if aluno:
        return jsonify({"mensagem": "Login realizado com sucesso!", "aluno": aluno})
    return jsonify({"erro": "Email ou senha incorretos"}), 401
