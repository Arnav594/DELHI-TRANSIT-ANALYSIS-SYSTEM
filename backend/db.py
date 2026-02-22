import psycopg2
import os

def get_connection():
    print("DATABASE_URL:", os.environ.get("DATABASE_URL"))  # DEBUG LINE
    return psycopg2.connect(os.environ.get("DATABASE_URL"))