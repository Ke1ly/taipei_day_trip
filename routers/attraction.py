from fastapi import *
from models.attraction import get_attractions_data_per_page, get_attractions_count, add_imgaes_to_attractions_data, get_attraction_by_id, get_mrt_lists
attraction_router = APIRouter()

@attraction_router.get("/api/attractions")
async def attractions(keyword: str = Query (default = None), page: int = Query(default = 0, ge = 0)):
	per_page=12
	offset = page * per_page
	if keyword:
		result_count = get_attractions_count(keyword)
		if result_count>0:
			result_attractions = get_attractions_data_per_page(per_page, offset, keyword)
		else:
			result_attractions = None
	else:
		result_count = get_attractions_count()
		result_attractions = get_attractions_data_per_page(per_page, offset)
	if result_attractions:
		for attraction in result_attractions:
			add_imgaes_to_attractions_data(attraction["id"], attraction)

	if result_count>(offset + per_page):
		next_page = page+ 1
	else:
		next_page = None
	return{"nextPage":next_page, "data":result_attractions}

@attraction_router.get("/api/attraction/{attractionId}")
async def attraction_by_id(attractionId:int = Path(..., ge = 1)):
	result_attraction = get_attraction_by_id(attractionId)
	if not result_attraction:
		raise HTTPException(status_code=400, detail="無此景點編號")
	attraction_data = add_imgaes_to_attractions_data(attractionId, result_attraction)
	return{"data":attraction_data}

@attraction_router.get("/api/mrts")
async def mrts():
	mrt_list = get_mrt_lists()
	return{"data":mrt_list}