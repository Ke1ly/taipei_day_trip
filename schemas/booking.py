from datetime import datetime, timedelta, timezone, date
from pydantic import BaseModel, Field, validator

class BookingAdd(BaseModel):
	date:date
	time:str
	attractionId:int= Field(..., gt=0)
	price:int
	@validator("date")
	def date_must_be_in_future(cls, value):
		today = datetime.now(timezone(timedelta(hours=8))).date()
		if value <= today:
			raise ValueError("日期必須在今天之後")
		return value