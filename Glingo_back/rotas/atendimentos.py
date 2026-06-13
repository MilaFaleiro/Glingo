# Rotas de Atendimentos e Mensagens

from flask import Blueprint, request, jsonify
from banco.conexao import conectar

atendimentos_bp = Blueprint('atendimentos', __name__)


# GET /atendimentos/aluno/<id> - Lista atendimentos de um aluno
@atendimentos_bp.route('/atendimentos/aluno/<int:aluno_id>', methods=['GET'])
def listar_atendimentos(aluno_id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, tipo, descricao, status, created_at
        FROM atendimento
        WHERE aluno_id = %s
        ORDER BY created_at DESC
    """, (aluno_id,))
    atendimentos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(atendimentos)


# POST /atendimentos - Abre um novo atendimento
@atendimentos_bp.route('/atendimentos', methods=['POST'])
def abrir_atendimento():
    dados = request.get_json()
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO atendimento (aluno_id, tipo, descricao)
            VALUES (%s, %s, %s)
        """, (dados['aluno_id'], dados['tipo'], dados.get('descricao', '')))
        conn.commit()
        atendimento_id = cursor.lastrowid
        return jsonify({"mensagem": "Atendimento aberto com sucesso!", "id": atendimento_id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# PATCH /atendimentos/<id>/concluir - Conclui um atendimento
@atendimentos_bp.route('/atendimentos/<int:id>/concluir', methods=['PATCH'])
def concluir_atendimento(id):
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE atendimento SET status = 'concluido' WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"mensagem": "Atendimento concluído com sucesso!"})
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()


# GET /atendimentos/<id>/mensagens - Lista mensagens de um atendimento
@atendimentos_bp.route('/atendimentos/<int:id>/mensagens', methods=['GET'])
def listar_mensagens(id):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, remetente, conteudo, tipo, data_envio
        FROM mensagem
        WHERE atendimento_id = %s
        ORDER BY data_envio ASC
    """, (id,))
    mensagens = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(mensagens)


# POST /atendimentos/<id>/mensagens - Envia uma mensagem
@atendimentos_bp.route('/atendimentos/<int:id>/mensagens', methods=['POST'])
def enviar_mensagem(id):
    dados = request.get_json()
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO mensagem (atendimento_id, remetente, conteudo)
            VALUES (%s, %s, %s)
        """, (id, dados['remetente'], dados['conteudo']))
        conn.commit()
        return jsonify({"mensagem": "Mensagem enviada com sucesso!"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
    finally:
        cursor.close()
        conn.close()
