from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from routers.user import user_router
from routers.attraction import attraction_router
from routers.booking import booking_router
from routers.order import order_router

app=FastAPI()
app.include_router(user_router)
app.include_router(attraction_router)
app.include_router(booking_router)
app.include_router(order_router)

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
@app.get("/member", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/member.html", media_type="text/html")

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