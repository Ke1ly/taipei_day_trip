
import os
from mysql.connector import pooling
from contextlib import contextmanager

dbconfig = {
"host": os.getenv("MYSQL_HOST"),
"user": os.getenv("MYSQL_USER"),
"password": os.getenv("MYSQL_PASSWORD"),
"database": os.getenv("MYSQL_DATABASE_02")
}
cnxpool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **dbconfig)

@contextmanager
def get_db():
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        yield cursor, cnx
    finally:
        cursor.close()
        cnx.close() 