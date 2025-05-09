
from dbconfig import get_db

# (1)查詢與 keyword 相符的 attraction 或 mrt (2)取得 "資料總數" 與 "當前頁面的景點資料"
def get_attractions_count(keyword=None):
    with get_db() as (cursor, cnx):
        if keyword :
            cursor.execute("SELECT COUNT(*) FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.name LIKE %s OR mrt.mrt= %s",(f"%{keyword}%",keyword))
        else:
            cursor.execute("SELECT COUNT(*) FROM attraction")
        result = cursor.fetchone()
        return result["COUNT(*)"] if result else 0


def get_attractions_data_per_page(per_page, offset, keyword=None):
    with get_db() as (cursor, cnx):
        if keyword :
            cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.name LIKE %s OR mrt.mrt= %s ORDER BY attraction.id ASC LIMIT %s OFFSET %s",(f"%{keyword}%",keyword,per_page,offset))
        else:
            cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id ORDER BY attraction.id ASC LIMIT %s OFFSET %s",(per_page,offset))
        return cursor.fetchall()

def add_imgaes_to_attractions_data(attraction_id, attraction):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s",(attraction_id,))
        img_urls = cursor.fetchall()
        url_list = [item['img_url'] for item in img_urls]
        attraction["images"]=url_list
        return attraction

def get_attraction_by_id(attraction_id):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT attraction.id,attraction.name,attraction.category, attraction.description,attraction.address,attraction.transport,mrt.mrt,attraction.lat,attraction.lng FROM attraction LEFT JOIN mrt ON attraction.mrt_id = mrt.id WHERE attraction.id = %s",(attraction_id,))
        return cursor.fetchone()

def get_mrt_lists():
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT mrt.mrt, COUNT(attraction.id) AS attraction_count FROM mrt LEFT JOIN  attraction ON attraction.mrt_id = mrt.id GROUP BY mrt.mrt ORDER BY attraction_count DESC")
        result_mrt=cursor.fetchall()
        mrt_list=[result["mrt"]for result in result_mrt]
        return mrt_list