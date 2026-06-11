import mysql.connector  # type: ignore[reportMissingImports]

def conectar():
    conexao = mysql.connector.connect(
        host="localhost",
        user="glingo",
        password="1234",
        database="glingo",
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
        auth_plugin="caching_sha2_password"
    )
    return conexao