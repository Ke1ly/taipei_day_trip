from fastapi import *
from dbconfig import get_db

def get_user_by_email(email: str):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT * FROM user WHERE email = %s",(email,))
        return cursor.fetchone()

def create_user(name: str, email: str, hashed_password: str):
      with get_db() as (cursor, cnx):
        cursor.execute("INSERT INTO user (name, email, password) VALUES (%s, %s, %s)",(name, email, hashed_password))
        cnx.commit()

def update_user_data( id:int, name: str = None, email:str = None):
      with get_db() as (cursor, cnx):
        if name:
          cursor.execute("UPDATE user SET name = %s WHERE id = %s",(name, id))
        elif email:
          cursor.execute("UPDATE user SET email = %s WHERE id = %s",(email, id))
        cnx.commit()

def update_user_avatar(url: str,id:int):
      with get_db() as (cursor, cnx):
          cursor.execute("UPDATE user SET avatar_url = %s WHERE id = %s", (url, id))
          cnx.commit()