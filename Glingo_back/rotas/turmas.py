# Rotas de Turmas e Idiomas

from flask import Blueprint, request, jsonify
from banco.conexao import conectar

turmas_bp = Blueprint('turmas', __name__)


# GET /idiomas - Lista todos os idiomas
@turmas_bp.route('/idiomas', methods=['GET'])
def listar_idiomas():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM idioma")
    idiomas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(idiomas)


# GET /turmas - Lista todas as turmas (com filtros opcionais)
@turmas_bp.route('/turmas', methods=['GET'])
def listar_turmas():
    idioma_id = request.args.get('idioma_id')
    nivel = request.args.get('nivel')

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT t.id, i.nome AS idioma, t.nivel, t.professor,
               t.horario, t.modalidade, t.vagas_total, t.vagas_restantes
        FROM turma t
        JOIN idioma i ON t.idioma_id = i.id
        WHERE 1=1
    """
    params = []

    if idioma_id:
        query += " AND t.idioma_id = %s"
        params.append(idioma_id)
    if nivel:
        query += " AND t.nivel = %s"
        params.append(nivel)

    cursor.execute(query, params)
    turmas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(turmas)


# GET /turmas/<id> - Busca uma turma pelo ID
@turmas_bp.route('/turmas/<int:id>', methods=['GET'])
def buscar_turma(id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT t.id, i.nome AS idioma, t.nivel, t.professor,
               t.horario, t.modalidade, t.vagas_total, t.vagas_restantes
        FROM turma t
        JOIN idioma i ON t.idioma_id = i.id
        WHERE t.id = %s
    """, (id,))
    turma = cursor.fetchone()
    cursor.close()
    conn.close()
    if turma:
        return jsonify(turma)
    return jsonify({"erro": "Turma não encontrada"}), 404


# POST /turmas - Cadastra uma nova turma (admin)
@turmas_bp.route('/turmas', methods=['POST'])
def cadastrar_turma():
    dados = request.get_json()
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO turma (idioma_id, nivel, professor, horario, modalidade, vagas_total, vagas_restantes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            dados['idioma_id'],
            dados['nivel'],
            dados['professor'],
            dados['horario'],
            dados['modalidade'],
            dados['vagas_total'],
            dados['vagas_total']
        ))
        conn.commit()
        return jsonify({"mensagem": "Turma cadastrada com sucesso!", "id": cursor.lastrowid}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
