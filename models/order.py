from dbconfig import get_db


def add_order_data(values):
      with get_db() as (cursor, cnx):
        query="INSERT INTO orders(attraction_id, date, price, time_slot, user_id, contact_name, contact_email, contact_phone, order_number)VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(query,values)
        cnx.commit()

def mark_order_paid(order_number):
      with get_db() as (cursor, cnx):
           cursor.execute("UPDATE orders SET status =%s WHERE order_number=%s",("PAID",order_number,))
           cnx.commit()

def get_order_by_number(order_number):
    with get_db() as (cursor, cnx):
        cursor.execute("SELECT * FROM orders LEFT JOIN attraction ON orders.attraction_id=attraction.id WHERE orders.order_number=%s",(order_number,))
        return cursor.fetchone()
def get_orders_by_id(user_id):
     with get_db() as (cursor, cnx):
        cursor.execute("SELECT * FROM orders LEFT JOIN attraction ON orders.attraction_id=attraction.id WHERE orders.user_id=%s",(user_id,))
        return cursor.fetchall()