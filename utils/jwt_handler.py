import jwt
import os
from datetime import datetime, timedelta

jwt_secret_key = os.getenv("JWT_SECRET_KEY")

def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=7)):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, jwt_secret_key , algorithm="HS256")

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token,jwt_secret_key , algorithms=["HS256"])
        return payload
    except jwt.InvalidTokenError:
        return None