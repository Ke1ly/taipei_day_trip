
from pydantic import BaseModel, Field, EmailStr, validator


class UserSignIn(BaseModel):
	email: EmailStr
	password: str =  Field(..., min_length=6, max_length=12)

class UserSignUp(BaseModel):
	name: str = Field(..., min_length=1, max_length=100)
	email: EmailStr
	password: str =  Field(..., min_length=6, max_length=12)