// [all] 寫入註冊資料
export async function signUp() {
  const name = document.getElementById("sign-up-name");
  const email = document.getElementById("sign-up-email");
  const password = document.getElementById("sign-up-pwd");
  let response = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value,
    }),
  });

  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "註冊時發生錯誤");
  }
  let signUpData = await response.json();
  return signUpData;
}

// [all] 更新登入狀態
export async function signIn() {
  const email = document.getElementById("sign-in-email");
  const password = document.getElementById("sign-in-pwd");
  let response = await fetch("/api/user/auth", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "註冊時發生錯誤");
  }
  let signInData = await response.json();
  return signInData;
}

// [all] 取得登入狀態
export async function fetchAuth(token) {
  const response = await fetch("/api/user/auth", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(errorData.message || "驗證身份時發生錯誤");
  }
  let authData = await response.json();
  return authData;
}

// [home] 取得 MRT 資料
export async function getMRT() {
  let response = await fetch(`/api/mrts`, {
    method: "GET",
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "取得資料時發生錯誤");
  }
  let mrtData = await response.json();
  return mrtData;
}

// [home] 取得單頁所有景點資料
export async function getAttractions(page) {
  let response = await fetch(`/api/attractions?page=${page}`, {
    method: "GET",
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "取得景點資料時發生錯誤");
  }
  let attractionsData = await response.json();
  return attractionsData;
}

// [home] 取得符合搜尋的景點資料
export async function getAttractionsBySearch(page) {
  let keyword = document.getElementById("keyword").value;
  let response = await fetch(
    `/api/attractions?keyword=${keyword}&page=${page}`,
    {
      method: "GET",
    }
  );
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "取得資料時發生錯誤");
  }
  let searchAttractionsData = await response.json();
  return searchAttractionsData;
}

// [attraction] 取得單一景點資料
export async function GetAttractionDataById(attractionId) {
  let response = await fetch(`/api/attraction/${attractionId}`, {
    method: "GET",
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "取得資料時發生錯誤");
  }
  let attractionData = await response.json();
  return attractionData;
}

// [attraction] 新增預訂
export async function addBooking(token, attractionId, date, time, price) {
  let response = await fetch("/api/booking", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      attractionId: attractionId,
      date: date,
      time: time,
      price: price,
    }),
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "新增預訂時發生錯誤");
  }
  let addBookingData = await response.json();
  return addBookingData;
}

// [booking] 取得預訂資料
export async function getBooking(token) {
  let response = await fetch("/api/booking", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  let bookingData = await response.json();
  return bookingData;
}

// [booking] 刪除預訂資料
export async function deleteBooking(token) {
  let response = await fetch("/api/booking", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(errorData.message || "刪除預訂資料時發生錯誤");
  }
  let deleteBookingData = await response.json();
  return deleteBookingData;
}

// [booking] 新增付款訂單
export async function addOrder(token, prime, bookingData, name, email, phone) {
  const totalPrice = document.getElementById("total-price");
  let response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prime: prime,
      order: {
        price: Number(totalPrice.textContent),
        trip: bookingData.data,
        contact: {
          phone: phone.value,
          name: name.value,
          email: email.value,
        },
      },
    }),
  });
  if (!response.ok) {
    throw new Error(errorData.message || "處理訂單與付款時發生錯誤");
  }
  let addOrderData = await response.json();
  return addOrderData;
}

// [thankyou] 取得付款訂單資料
export async function GetOrderDataByNumber(token, number) {
  let response = await fetch(`/api/order/${number}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "取得訂單時發生錯誤");
  }
  let orderData = await response.json();
  return orderData;
}
