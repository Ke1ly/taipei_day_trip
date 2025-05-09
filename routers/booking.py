
from fastapi import *
from schemas.booking import BookingAdd
from models.booking import get_booking_data, get_one_image_by_attraction, delete_booking_data, add_booking_data
from routers.user import verify_jwt_token


booking_router= APIRouter()

@booking_router.get("/api/booking")
async def get_booking( payload: dict = Depends(verify_jwt_token)):
		latestBooking = get_booking_data(payload["data"]["id"])
		if latestBooking:
			firstImg = get_one_image_by_attraction(latestBooking["id"])
			return{"data":{"attraction":{"id":latestBooking["id"],"name":latestBooking["name"],"address":latestBooking["address"],"image":firstImg["img_url"]},"date":latestBooking["date"],"time":latestBooking["time_slot"],"price":latestBooking["price"]}}
		else:
			return{"data":None}

@booking_router.post("/api/booking")
async def create_new_booking(body: BookingAdd, payload: dict = Depends(verify_jwt_token)):
	if not body.date or not body.time:
		return {"error": True,"message": "請選擇預定時間與日期"}
	add_booking_data(body.attractionId, payload["data"]["id"], body.date, body.time, body.price)
	return {"ok":True}

@booking_router.delete("/api/booking")
async def delete_booking(payload: dict = Depends(verify_jwt_token)):
	delete_booking_data(payload["data"]["id"])	
	return {"ok":True}