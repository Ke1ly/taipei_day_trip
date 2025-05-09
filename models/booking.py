from dbconfig import get_db


def get_booking_data(user_id: int):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT * FROM booking INNER JOIN attraction ON booking.attraction_id=attraction.id WHERE booking.user_id =%s ORDER BY booking_time DESC LIMIT 1",(user_id,))
        return cursor.fetchone()

def get_one_image_by_attraction(attraction_id: int):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT img_url FROM img JOIN attraction ON attraction.id = img.attraction_id WHERE attraction.id = %s LIMIT 1",(attraction_id,))
        return cursor.fetchone()
    
def delete_booking_data(user_id: int):
    with get_db() as (cursor, cnx):
        cursor.execute("DELETE FROM booking WHERE user_id = %s",(user_id,))
        cnx.commit()

def add_booking_data(attraction_id, user_id, date, time, price):
    with get_db() as (cursor, cnx):
        query="INSERT INTO booking(attraction_id, user_id, date, time_slot, price)VALUES (%s, %s, %s, %s, %s)ON DUPLICATE KEY UPDATE attraction_id = VALUES(attraction_id),date = VALUES(date),time_slot = VALUES(time_slot),price = VALUES(price)"
        values = (attraction_id, user_id, date, time, price)
        cursor.execute(query,values)
        cnx.commit()