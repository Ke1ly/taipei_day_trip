from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import os
from mysql.connector import pooling
from fastapi.staticfiles import StaticFiles
import jwt
from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import tappay
import uuid

app=FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")

# 建立連線池
dbconfig = {
"host": os.getenv("MYSQL_HOST"),
"user": os.getenv("MYSQL_USER"),
"password": os.getenv("MYSQL_PASSWORD"),
"database": os.getenv("MYSQL_DATABASE_02")
}
cnxpool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **dbconfig)

# 從連線池取得連線 # 依賴函式
def get_db():
    cnx = cnxpool.get_connection()
    cursor = cnx.cursor(dictionary=True)
    try:
        yield cursor,cnx
    finally:
        cursor.close()
        cnx.close() 

# 錯誤處理函式
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": True, "message": "伺服器內部錯誤"}
    )
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": str(exc.detail)} 
    )

@app.get("/api/attractions")
async def get_attractions(request: Request,keyword: str | None = Query (None), page: int = Query(0), db=Depends(get_db)):
	cursor, cnx = db
	per_page=12
	offset = page * per_page
	if keyword:
		# 01 於 attraction-mrt 關聯表中查詢與 keyword 相符的 attraction name 或 mrt name，並取得相符景點之 "資料總數" 與 "當前頁面的景點資料"
		cursor.execute("SELECT COUNT(*) FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.name LIKE %s OR mrt.mrt= %s",(f"%{keyword}%",keyword))
		total_count=cursor.fetchone()
		if total_count["COUNT(*)"]>0:
			cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.name LIKE %s OR mrt.mrt= %s ORDER BY attraction.id ASC LIMIT %s OFFSET %s",(f"%{keyword}%",keyword,per_page,offset))
			result_attraction = cursor.fetchall()
		else:
			result_attraction = None
	else:
		cursor.execute("SELECT COUNT(*) FROM attraction")
		total_count=cursor.fetchone()
		cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id ORDER BY attraction.id ASC LIMIT %s OFFSET %s",(per_page,offset))
		result_attraction = cursor.fetchall()

	# 02 在 result_attraction 列表中，逐一於每個景點 dict 中加入其相應的 img list
	if result_attraction:
		for result in result_attraction:
			cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s",(result["id"],))
			img_urls = cursor.fetchall()
			url_list = [item['img_url'] for item in img_urls]
			result["images"]=url_list

	# 檢查是否有 nextPage，若有，設定 nextPage 值
	if total_count["COUNT(*)"]>(offset + per_page):
		nextPage = page+ 1
	else:
		nextPage = None
	return{"nextPage":nextPage, "data":result_attraction}

@app.get("/api/attraction/{attractionId}")
async def get_attraction_by_id(request: Request, attractionId:int, db=Depends(get_db)):
	cursor, cnx = db
	cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.id = %s",(attractionId,))
	result = cursor.fetchone()
	if not result:
		raise HTTPException(status_code=400, detail="無此景點編號")
	cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s",(result["id"],))
	img_urls = cursor.fetchall()
	url_list = [item['img_url'] for item in img_urls]
	result["images"]=url_list
	return{"data":result}

@app.get("/api/mrts")
async def get_mrts(request: Request, db=Depends(get_db)):
	cursor, cnx = db
	cursor.execute("SELECT mrt.mrt, COUNT(attraction.id) AS attraction_count FROM mrt LEFT JOIN  attraction ON attraction.mrt_id = mrt.id GROUP BY mrt.mrt ORDER BY attraction_count DESC")
	result_mrt=cursor.fetchall()
	mrt_list=[result["mrt"]for result in result_mrt]
	return{"data":mrt_list}

@app.post("/api/user")
async def sign_up(request: Request, db=Depends(get_db),body=Body(None) ):
	cursor, cnx = db
	if not body["name"] or not body["email"] or not body["password"]:
		return {"error": True,"message": "請填打所有欄位"}
	cursor.execute("SELECT * FROM user WHERE email = %s",(body["email"],))
	existAccount = cursor.fetchone()
	if existAccount:
		return {"error": True,"message": "此 Email 已經註冊帳戶"}
	cursor.execute("INSERT INTO user(name, email, password) VALUES (%s,%s,%s)",(body["name"],body["email"],body["password"]))
	cnx.commit()
	return {"ok": True}

@app.get("/api/user/auth")
async def verify_jwt_token(request: Request,credentials: HTTPAuthorizationCredentials = Security(HTTPBearer())):
	secret = os.getenv("JWT_SECRET_KEY")
	token = credentials.credentials
	try:
		payload = jwt.decode(token, secret ,algorithms=["HS256"])
		return {"data":{"id":payload["id"], "name":payload["name"], "email":payload["email"]}}
	except jwt.InvalidTokenError:
		return {"data":None}

@app.put("/api/user/auth")
async def sign_in(request: Request, db=Depends(get_db),body=Body(None)):
	secret = os.getenv("JWT_SECRET_KEY")
	algorithm = os.getenv("ALGORITHM")
	cursor, cnx = db
	if not body["email"] or not body["password"]:
		return {"error": True,"message": "請填打所有欄位"}
	cursor.execute("SELECT * FROM user WHERE email = %s and password=%s",(body["email"],body["password"]))
	account = cursor.fetchone()
	if not account:
		return {"error": True,"message": "Email 或密碼不正確"}
	expire = datetime.utcnow() + timedelta(days=7)
	encoded_jwt = jwt.encode({"id":account["id"] ,"name":account["name"] ,"email": body["email"],"exp":expire}, secret, algorithm)
	return{"token":encoded_jwt}

@app.get("/api/booking")
async def get_booking(request: Request, db=Depends(get_db), payload: dict = Depends(verify_jwt_token)):
		cursor, cnx = db
		cursor.execute("SELECT * FROM booking INNER JOIN attraction ON booking.attraction_id=attraction.id WHERE booking.user_id =%s ORDER BY booking_time DESC LIMIT 1",(payload["data"]["id"],))
		latestBooking = cursor.fetchone()
		if latestBooking:
			cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s LIMIT 1",(latestBooking["id"],))
			firstImg = cursor.fetchone()
			return{"data":{"attraction":{"id":latestBooking["id"],"name":latestBooking["name"],"address":latestBooking["address"],"image":firstImg["img_url"]},"date":latestBooking["date"],"time":latestBooking["time_slot"],"price":latestBooking["price"]}}
		else:
			return{"data":None}

@app.post("/api/booking")
async def create_new_booking(request: Request, db=Depends(get_db),body=Body(None),payload: dict = Depends(verify_jwt_token)):
	cursor, cnx = db
	if not body["date"] or not body["time"]:
		return {"error": True,"message": "請選擇預定時間與日期"}
	query="INSERT INTO booking(attraction_id, user_id, date, time_slot, price)VALUES (%s, %s, %s, %s, %s)ON DUPLICATE KEY UPDATE attraction_id = VALUES(attraction_id),date = VALUES(date),time_slot = VALUES(time_slot),price = VALUES(price)"
	values = (
    body["attractionId"],
    payload["data"]["id"],
    body["date"],
    body["time"],
    body["price"])
	cursor.execute(query,values)
	cnx.commit()
	return {"ok":True}

@app.delete("/api/booking")
async def delete_booking(request: Request, db=Depends(get_db),payload: dict = Depends(verify_jwt_token)):
	cursor, cnx = db
	cursor.execute("DELETE FROM booking WHERE user_id = %s",(payload["data"]["id"],))
	cnx.commit()
	return {"ok":True}

@app.post("/api/orders")
async def create_order(request: Request, db=Depends(get_db),payload: dict = Depends(verify_jwt_token),body=Body(None)):
	cursor, cnx = db
	date_str = datetime.utcnow().strftime("%Y%m%d")
	suffix = uuid.uuid4().hex[:8].upper()
	order_number= f"{date_str}{suffix}"
	query="INSERT INTO orders(attraction_id, date, price, time_slot, user_id, contact_name, contact_email, contact_phone, order_number)VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
	values = (body["order"]["trip"]["attraction"]["id"], body["order"]["trip"]["date"], body["order"]["price"], body["order"]["trip"]["time"], payload["data"]["id"], body["order"]["contact"]["name"], body["order"]["contact"]["email"], body["order"]["contact"]["phone"],order_number)
	cursor.execute(query,values)
	cnx.commit()

	partner_key=os.getenv("TP_PARTNER_KEY")
	merchant_id=os.getenv("TP_MERCHANT_ID")
	client = tappay.Client(True, partner_key, merchant_id)
	card_holder_data = tappay.Models.CardHolderData(body["order"]["contact"]["phone"], body["order"]["contact"]["name"], body["order"]["contact"]["email"])
	response_data_dict = client.pay_by_prime(body["prime"], body["order"]["price"], "payment_details", card_holder_data)
	if response_data_dict["status"]==0:
		cursor.execute("UPDATE orders SET status =%s WHERE order_number=%s",("PAID",order_number,))
		cnx.commit()
	return {"data":{"number":order_number,"payment":{"status":response_data_dict["status"],"message":response_data_dict["msg"]}}}

@app.get("/api/order/{orderNumber}")
async def get_order(request: Request, orderNumber:str, payload: dict = Depends(verify_jwt_token), db=Depends(get_db)):
	cursor, cnx = db
	cursor.execute("SELECT * FROM orders LEFT JOIN attraction ON orders.attraction_id=attraction.id WHERE orders.order_number=%s",(orderNumber,))
	order = cursor.fetchone()
	if order:
		if order["status"]=="PAID":
			status=1
		else:
			status=0
		cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s LIMIT 1",(order["attraction_id"],))
		firstImg = cursor.fetchone()
		return {
			"data":{
				"number":order["order_number"],
				"price":order["price"],
				"trip":{
					"attraction":{
						"id":order["attraction_id"],
						"name":order["name"],
						"address":order["address"],
						"image":firstImg["img_url"]
					},
					"date":order["date"],
					"time":order["time_slot"],
				},
				"contact":{
					"name":order["contact_name"],
					"email":order["contact_email"],
					"phone":order["contact_phone"],
				},
				"status":status,
			}
		}
	else:
		return {"error":True,"message":"查無訂單"}