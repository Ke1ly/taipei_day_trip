from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import os
from mysql.connector import pooling
from fastapi.staticfiles import StaticFiles

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
        yield cursor 
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
async def get_attractions(request: Request,keyword: str | None = Query (None), page: int = Query(0),cursor=Depends(get_db)):
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
async def get_attraction_by_id(request: Request,attractionId:int,cursor=Depends(get_db)):
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
async def get_mrts(request: Request,cursor=Depends(get_db)):
	cursor.execute("SELECT mrt.mrt, COUNT(attraction.id) AS attraction_count FROM mrt LEFT JOIN  attraction ON attraction.mrt_id = mrt.id GROUP BY mrt.mrt ORDER BY attraction_count DESC")
	result_mrt=cursor.fetchall()
	mrt_list=[result["mrt"]for result in result_mrt]
	return{"data":mrt_list}