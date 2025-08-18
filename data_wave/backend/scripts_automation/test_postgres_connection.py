import psycopg2
from psycopg2 import OperationalError

def test_postgres_connection():
    try:
        # Configuration de la connexion
        connection = psycopg2.connect(
            dbname="testdb",
            user="admin",
            password="admin",
            host="localhost",
            port="5432"
        )

        print("✅ Connexion réussie à PostgreSQL !")

        # Fermer la connexion
        connection.close()
    except OperationalError as e:
        print("❌ Échec de la connexion à PostgreSQL :")
        print(e)

if __name__ == "__main__":
    test_postgres_connection()
