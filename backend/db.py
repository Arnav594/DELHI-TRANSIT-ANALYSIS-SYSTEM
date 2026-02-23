import psycopg2

def get_connection():
    return psycopg2.connect(
        database="postgres",
        user="postgres",
        password="QWERTYUIop@123",
        host="localhost",
        port="5432"
    )