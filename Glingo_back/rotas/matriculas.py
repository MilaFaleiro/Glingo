# Rotas de Matrículas

from flask import Blueprint, request, jsonify
from banco.conexao import conectar

matriculas_bp = Blueprint('matriculas', __name__)


# GET /matriculas/aluno/<id> - Lista matrículas de um aluno
@matriculas_bp.route('/matriculas/aluno/<int:aluno_id>', methods=['GET'])
def listar_matriculas_aluno(aluno_id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT m.id, i.nome AS idioma, t.nivel, t.professor,
               t.horario, t.modalidade, m.data_matricula, m.status
        FROM matricula m
        JOIN turma t ON m.turma_id = t.id
        JOIN idioma i ON t.idioma_id = i.id
        WHERE m.aluno_id = %s
        ORDER BY m.data_matricula DESC
    """, (aluno_id,))
    matriculas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(matriculas)


# POST /matriculas - Realiza uma matrícula
@matriculas_bp.route('/matriculas', methods=['POST'])
def realizar_matricula():
    dados = request.get_json()
    aluno_id = dados.get('aluno_id')
    turma_id = dados.get('turma_id')

    if not aluno_id or not turma_id:
        return jsonify({"erro": "aluno_id e turma_id são obrigatórios"}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    # Verifica se há vagas
    cursor.execute("SELECT vagas_restantes FROM turma WHERE id = %s", (turma_id,))
    turma = cursor.fetchone()

    if not turma:
        return jsonify({"erro": "Turma não encontrada"}), 404
    if turma['vagas_restantes'] <= 0:
        return jsonify({"erro": "Turma sem vagas disponíveis"}), 400

    # Verifica se o aluno já está matriculado nessa turma
    cursor.execute(
        "SELECT id FROM matricula WHERE aluno_id = %s AND turma_id = %s AND status = 'ativa'",
        (aluno_id, turma_id)
    )
    if cursor.fetchone():
        return jsonify({"erro": "Aluno já matriculado nessa turma"}), 400

    try:
        # Insere a matrícula
        cursor2 = conn.cursor()
        cursor2.execute(
            "INSERT INTO matricula (aluno_id, turma_id) VALUES (%s, %s)",
            (aluno_id, turma_id)
        )
        # Diminui uma vaga
        cursor2.execute(
            "UPDATE turma SET vagas_restantes = vagas_restantes - 1 WHERE id = %s",
            (turma_id,)
        )
        conn.commit()
        return jsonify({"mensagem": "Matrícula realizada com sucesso!", "id": cursor2.lastrowid}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# PATCH /matriculas/<id>/cancelar - Cancela uma matrícula
@matriculas_bp.route('/matriculas/<int:id>/cancelar', methods=['PATCH'])
def cancelar_matricula(id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT turma_id, status FROM matricula WHERE id = %s", (id,))
    matricula = cursor.fetchone()

    if not matricula:
        return jsonify({"erro": "Matrícula não encontrada"}), 404
    if matricula['status'] == 'cancelada':
        return jsonify({"erro": "Matrícula já cancelada"}), 400

    try:
        cursor2 = conn.cursor()
        cursor2.execute("UPDATE matricula SET status = 'cancelada' WHERE id = %s", (id,))
        cursor2.execute(
            "UPDATE turma SET vagas_restantes = vagas_restantes + 1 WHERE id = %s",
            (matricula['turma_id'],)
        )
        conn.commit()
        return jsonify({"mensagem": "Matrícula cancelada com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
