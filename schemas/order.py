from fastapi import *
from datetime import datetime, timedelta, timezone, date
from pydantic import BaseModel, Field, EmailStr, validator



class OrderContact(BaseModel):
	name:str = Field(..., min_length=1, max_length=100)
	email:EmailStr
	phone:str

class OrderAttraction(BaseModel):
	id:int= Field(..., gt=0)
	image:str
	name:str
	address:str

class OrderTrip(BaseModel):
	attraction:OrderAttraction
	date:date
	time:str
	@validator("date")
	def date_must_be_in_future(cls, value):
		today = datetime.now(timezone(timedelta(hours=8))).date()
		if value <= today:
			raise ValueError("日期必須在今天之後")
		return value

class Order(BaseModel):
	price: int
	trip: OrderTrip
	contact: OrderContact

class OrderAdd(BaseModel):
	prime: str
	order: Order
