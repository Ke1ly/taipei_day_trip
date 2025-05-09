from fastapi import *
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas.user import UserSignIn, UserSignUp
from models.user import get_user_by_email, create_user, update_user_data, update_user_avatar
from utils.password_handler import hash_password, verify_password
from utils.jwt_handler import create_access_token, decode_access_token
import os
import shutil
# from routers.user import verify_jwt_token

user_router = APIRouter()


@user_router.post("/api/user")
async def sign_up(body:UserSignUp):
	if not body.name or not body.email or not body.password:
		return {"error": True,"message": "請填打所有欄位"}
	existUser = get_user_by_email(body.email)
	if existUser:
		return {"error": True,"message": "此 Email 已經註冊帳戶"}
	hashed_password = hash_password(body.password)
	create_user(body.name, body.email, hashed_password)
	return {"ok": True}



@user_router.get("/api/user/auth")
async def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())):
	token = credentials.credentials
	payload = decode_access_token(token)
	# return {"data":payload}
	return {"data":{"id":payload["id"], "name":payload["name"], "email":payload["email"],"avatar": payload["avatar"]}}


@user_router.patch("/api/user")
async def update_name(body=Body(None) ,payload: dict = Depends(verify_jwt_token)):
	if body["name"]:
		update_user_data(payload["data"]["id"], name=body["name"])
	elif body["email"]:
		update_user_data(payload["data"]["id"], email=body["email"])
	
	
@user_router.post("/upload")
async def upload_image(image: UploadFile = File(...), payload: dict = Depends(verify_jwt_token)):
	upload_dir = "uploads/"
	os.makedirs(upload_dir, exist_ok=True)

	file_path = os.path.join(upload_dir, image.filename)
	with open(file_path, "wb") as buffer:
		shutil.copyfileobj(image.file, buffer)
	update_user_avatar(file_path, payload["data"]["id"])
	return {
        "message": "Upload successful",
        "filename": image.filename,
        "filepath": file_path
    }

@user_router.put("/api/user/auth")
async def sign_in(body:UserSignIn):
	if not body.email or not body.password:
		return {"error": True,"message": "請填打所有欄位"}
	user = get_user_by_email(body.email)
	if not user:
		return {"error": True,"message": "Email 不正確"}
	if not verify_password(body.password, user["password"]):
		raise {"error": True,"message": "密碼不正確"}
	else:
		token = create_access_token({"id": user["id"], "name": user["name"], "email": user["email"], "avatar": user["avatar_url"]})
		return{"token":token}