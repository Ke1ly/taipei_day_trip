// [all] 渲染按鈕＿預設 (登入/註冊、預定行程、開始預定行程)
export function renderInit(btnlist) {
  const authBtn = document.querySelector(".sign-in-or-sign-up");
  const toBookingBtn = document.getElementById("booking-btn");
  authBtn.textContent = "登入/註冊";

  btnlist.push(authBtn, toBookingBtn);
  btnlist.forEach((button) => {
    button.onclick = showDialog;
  });
}

// [all] 渲染按鈕＿登入 (登出、預定行程、開始預定行程)
export function renderAuth() {
  const authBtn = document.querySelector(".sign-in-or-sign-up");
  const toBookingBtn = document.getElementById("booking-btn");
  authBtn.textContent = "會員中心";
  authBtn.addEventListener("click", () => {
    location.replace("/member");
  });
  toBookingBtn.addEventListener("click", () => {
    location.replace("/booking");
  });
}

function showDialog() {
  const signInDialog = document.querySelector(".sign-in-popup");
  const signInResponse = document.getElementById("sign-in-response");
  const signInForm = document.getElementById("sign-in-form");

  signInResponse.replaceChildren();
  signInForm.reset();
  signInDialog.showModal();
  signInDialog.classList.add("show");
}

// [all] 渲染註冊或登入時的錯誤訊息
export function renderSignMessage(area, msg, color) {
  area.textContent = msg;
  area.style.color = color;
  area.style.marginBottom = "10px";
}

// [home] 渲染 MRT 列表
export function renderMRT(mrtData) {
  try {
    const template = document.getElementById("mrt-template");
    for (let i = 0; i < mrtData["data"].length; i++) {
      const mrtButton = template.content.cloneNode(true).children[0];
      mrtButton.textContent = mrtData["data"][i];
      const mrtList = document.getElementById("mrt-list");
      mrtList.appendChild(mrtButton);
    }
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

// [home] 渲染景點 (包含名稱, 類別, MRT, 首張圖片)
export function renderAttractions(attractionsData) {
  try {
    for (let i = 0; i < attractionsData["data"].length; i++) {
      const template = document.getElementById("attraction-template");
      let attractionItem = template.content.cloneNode(true);
      const attractionA = attractionItem.querySelector("a");
      attractionA.href = `/attraction/${attractionsData["data"][i]["id"]}`;

      const attractionImg = attractionItem.querySelector("img");
      let imgURL = attractionsData["data"][i]["images"][0];
      attractionImg.src = imgURL;
      attractionImg.alt = attractionsData["data"][i]["name"] + "的圖片";

      const attractionName = attractionItem.querySelector("figcaption");
      attractionName.textContent = attractionsData["data"][i]["name"];

      const div = attractionItem.querySelector("div");
      const attractionCategory = div.querySelector(".attraction-category");
      attractionCategory.textContent = attractionsData["data"][i]["category"];

      const attractionMRT = div.querySelector(".attraction-mrt");
      attractionMRT.textContent = attractionsData["data"][i]["mrt"];

      const attractionSection = document.getElementById("attraction-section");
      attractionSection.appendChild(attractionItem);
    }
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

// [attraction] 渲染單一景點資料 (包含名稱, 類別, 描述, 地址, 交通)
export function RenderAttractionInfo(attractionData) {
  try {
    const attractionName = document.getElementById("attraction-name");
    const attractionCategory = document.getElementById("attraction-category");
    const attractionDescription = document.getElementById(
      "attraction-description"
    );
    const attractionAddress = document.getElementById("attraction-address");
    const attractionTransport = document.getElementById("attraction-transport");

    attractionName.textContent = attractionData["data"]["name"];
    attractionCategory.textContent = `${attractionData["data"]["category"]} at ${attractionData["data"]["mrt"]}`;
    attractionDescription.textContent = attractionData["data"]["description"];
    attractionAddress.textContent = attractionData["data"]["address"];
    attractionTransport.textContent = attractionData["data"]["transport"];
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

export function preloadImages(imageUrlList) {
  const images = [];
  for (let i = 0; i < imageUrlList.length; i++) {
    images[i] = new Image(); //建立 Image 實例
    images[i].src = imageUrlList[i]; //指定 Image 的 src（預載）
  }
  console.log("圖片預載完畢");
  console.log(images);
  return images;
}

// [attraction] 渲染單一景點的所有圖片
export function RenderAttractionImg(images) {
  try {
    let slides = [];
    let indicators = [];
    const imgSection = document.getElementById("attraction-images");
    const indicatorsDiv = imgSection.querySelector(".indicators");
    for (let i = 0; i < images.length; i++) {
      let img = document.createElement("img");
      img.classList.add("slide");
      img.src = images[i].src;
      let indicator = document.createElement("span");
      indicator.classList.add("indicator");
      if (i == 0) {
        img.classList.add("active");
        indicator.classList.add("active");
      }
      indicatorsDiv.appendChild(indicator);
      imgSection.appendChild(img);
      slides.push(img);
      indicators.push(indicator);
    }
    return { slides, indicators };
  } catch (error) {
    console.error("渲染圖片時發生錯誤", error);
  }
}

// [booking] 渲染預訂資訊
export function renderBooking(bookingData, userName, userEmail) {
  const spanUserName = document.getElementById("user-name");
  spanUserName.textContent = userName;
  const bookedAttractionName = document.getElementById(
    "booked-attraction-name"
  );
  bookedAttractionName.textContent = bookingData.data.attraction.name;

  const bookingDate = document.getElementById("booking-date");
  bookingDate.textContent = bookingData.data.date;
  const bookingTime = document.getElementById("booking-time");
  if (bookingData.data.time == "上半天") {
    bookingTime.textContent = "早上 9 點到下午 4 點";
  } else {
    bookingTime.textContent = "下午 2 點到晚上 9 點";
  }
  const bookingPrice = document.getElementById("booking-price");
  bookingPrice.textContent = bookingData.data.price;
  const totalPrice = document.getElementById("total-price");
  totalPrice.textContent = bookingData.data.price;
  const bookingAddress = document.getElementById("booking-address");
  const bookingImg = document.getElementById("booking-img");
  bookingAddress.textContent = bookingData.data.attraction.address;
  bookingImg.setAttribute("src", bookingData.data.attraction.image);
  const contactName = document.getElementById("contact-name");
  contactName.value = userName;
  const contactEmail = document.getElementById("contact-email");
  contactEmail.value = userEmail;
}

// [booking] 渲染無預訂資訊
export function renderNoBooking(userName) {
  const spanUserName = document.getElementById("user-name");
  spanUserName.textContent = userName;
  let newP = document.createElement("p");
  newP.textContent = "目前沒有任何待預訂的行程";
  newP.classList.add("no-booking");
  const divMain = document.querySelector("main");
  divMain.replaceChildren(newP);
  const footer = document.querySelector("footer");
  footer.classList.add("no-booking");
}

// [thankyou] 渲染付款訂單成功訊息
export function renderOrderSuccess(orderData) {
  const orderNumber = document.getElementById("order-number");
  const status = document.getElementById("payment-status");
  orderNumber.textContent = orderData.data.number;
  if (orderData.data.status == 1) {
    status.textContent = "已付款";
  } else {
    status.textContent = "尚未付款";
  }
}

// [member] 渲染所有訂單資訊
export function renderOrders(orders) {
  for (let i = 0; i < orders["data"].length; i++) {
    const template = document.getElementById("order-template");
    let orderItem = template.content.cloneNode(true);
    const orderNumber = orderItem.querySelector(".order-number");
    orderNumber.textContent = orders["data"][i]["order_number"];

    const orderTime = orderItem.querySelector(".order-time");
    orderTime.textContent = orders["data"][i]["order_time"];

    const orderPrice = orderItem.querySelector(".order-price");
    orderPrice.textContent = orders["data"][i]["price"];

    const orderTable = document.getElementById("order-table");
    orderTable.appendChild(orderItem);
  }
}
