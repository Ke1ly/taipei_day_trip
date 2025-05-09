
from fastapi import *
from dotenv import load_dotenv
import os
from schemas.order import OrderAdd
from models.order import add_order_data, mark_order_paid, get_order_by_number, get_orders_by_id
from datetime import datetime, timedelta, timezone, date
import uuid
import tappay
from routers.user import verify_jwt_token
from models.booking import get_one_image_by_attraction

load_dotenv()
order_router = APIRouter()

@order_router.post("/api/orders")
async def create_order(body:OrderAdd, payload: dict = Depends(verify_jwt_token)):
	date_str = datetime.utcnow().strftime("%Y%m%d")
	suffix = uuid.uuid4().hex[:8].upper()
	order_number= f"{date_str}{suffix}"
	values = (body.order.trip.attraction.id, body.order.trip.date, body.order.price, body.order.trip.time, payload["data"]["id"], body.order.contact.name, body.order.contact.email, body.order.contact.phone, order_number)
	add_order_data(values)

	partner_key=os.getenv("TP_PARTNER_KEY")
	merchant_id=os.getenv("TP_MERCHANT_ID")
	client = tappay.Client(True, partner_key, merchant_id)
	card_holder_data = tappay.Models.CardHolderData(body.order.contact.phone, body.order.contact.name, body.order.contact.email)
	response_data_dict = client.pay_by_prime(body.prime, body.order.price, "payment_details", card_holder_data)
	if response_data_dict["status"]==0:
		mark_order_paid(order_number)
	return {"data":{"number":order_number,"payment":{"status":response_data_dict["status"],"message":response_data_dict["msg"]}}}

@order_router.get("/api/orders")
async def get_orders(payload: dict = Depends(verify_jwt_token)):
	ordersData = get_orders_by_id(payload["data"]["id"])
	return {"data":ordersData}


@order_router.get("/api/order/{orderNumber}")
async def get_order(orderNumber:str= Path(..., minlength=16), payload: dict = Depends(verify_jwt_token)):
	order = get_order_by_number(orderNumber)
	if order:
		if order["status"]=="PAID":
			status=1
		else:
			status=0
		firstImg = get_one_image_by_attraction(order["attraction_id"])
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