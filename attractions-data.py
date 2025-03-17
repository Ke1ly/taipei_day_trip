import json
import mysql.connector
import os

# 抓取所有景點資料，放入變數 attractions_data
src="data/taipei-attractions.json"
with open(src) as src:
    src_data = json.load(src)
attractions_data=src_data["result"]["results"]

# 測試資料
# for attraction in attractions_data:
#         print(attraction["name"],attraction["MRT"])
# print(len(attractions_data))

# 建立 MySQL 資料庫連線
conn = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE_02")
)
cursor = conn.cursor(dictionary=True)

# 在 MySQL 資料庫中建立 mrt 資料表，並寫入資料
# cursor.execute("CREATE TABLE mrt(id BIGINT PRIMARY KEY AUTO_INCREMENT,mrt VARCHAR(255) NOT NULL)")
# mrt_list = []
# for attraction in attractions_data:
#     if attraction["MRT"]:
#         if attraction["MRT"] not in mrt_list:
#             mrt_list.append(attraction["MRT"])
#             cursor.execute("INSERT INTO mrt(mrt) VALUES (%s)",(attraction["MRT"],))
# conn.commit()

# 在 MySQL 資料庫中建立 attraction 資料表，與 mrt 建立關聯，並寫入資料
# cursor.execute("CREATE TABLE attraction(id BIGINT PRIMARY KEY AUTO_INCREMENT,name VARCHAR(255) NOT NULL,category VARCHAR(255) NOT NULL,description VARCHAR(2000) NOT NULL,address VARCHAR(255) NOT NULL,transport VARCHAR(2000) NOT NULL,mrt_id BIGINT,lat DECIMAL(10,6) NOT NULL,lng DECIMAL(10,6) NOT NULL,FOREIGN KEY (mrt_id) REFERENCES mrt(id) ON DELETE CASCADE)")
# for attraction in attractions_data:
#     if not attraction["MRT"]:
#         attraction["MRT"]="無"
#         mrt_id= None
#     else:
#         cursor.execute("SELECT id FROM mrt WHERE mrt = %s", (attraction["MRT"],))
#         mrt_id=cursor.fetchone()["id"]
#     values = (attraction["name"], attraction["CAT"], attraction["description"],attraction["address"],attraction["direction"],mrt_id,attraction["latitude"],attraction["longitude"])
#     cursor.execute("INSERT INTO attraction (name, category, description,address,transport,mrt_id,lat,lng) VALUES (%s, %s, %s,%s,%s,%s,%s,%s)", values)
# conn.commit()

# 在 MySQL 資料庫中建立 img 資料表，與 attraction 建立關聯，並寫入資料
# cursor.execute("CREATE TABLE img(id BIGINT PRIMARY KEY AUTO_INCREMENT,attraction_id BIGINT NOT NULL,img_url VARCHAR(255) NOT NULL,FOREIGN KEY (attraction_id) REFERENCES attraction(id) ON DELETE CASCADE) ")
# for attraction in attractions_data:
#     # 篩選 Img 資料，存入 img_list
#     urls=attraction["file"].split('https')
#     img_list=[]
#     for url in urls:
#         if url[-3:] in ["jpg", "JPG","png","PNG"]:
#             img_list.append("https"+url)
#     # 找到景點 id
#     cursor.execute("SELECT id FROM attraction WHERE name = %s", (attraction["name"],))
#     attraction_id = cursor.fetchone()[0]
#     # 一一將 img_list 中的 img_url 存入 img 資料表
#     for img in img_list:
#         cursor.execute("INSERT INTO img (attraction_id, img_url) VALUES (%s,%s)",(attraction_id,img))
#     conn.commit()

cursor.close()
conn.close()