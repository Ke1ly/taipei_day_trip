import {
  fetchAuth,
  updateUserData,
  getOrdersById,
  GetOrderDataByNumber,
} from "../model/api.js";
import { renderOrders } from "../view/render.js";
import { handleAuth } from "../controller/common.js";

let token = localStorage.getItem("token");
handleAuth(token, {
  onSuccess: (authData) => {
    if (authData.data.avatar !== null) {
      document.getElementById("preview").src = authData.data.avatar;
    }
    const updateName = document.getElementById("update-name");
    const updateEmail = document.getElementById("update-email");
    updateName.setAttribute("placeholder", authData.data.name);
    updateEmail.setAttribute("placeholder", authData.data.email);
  },
});

let orders = await getOrdersById(token);
console.log("getOrdersById 資料", orders);
renderOrders(orders);

const orderNumber = document.querySelectorAll("td.order-number");
orderNumber.forEach((number) => {
  number.addEventListener("click", async () => {
    let orderData = await GetOrderDataByNumber(token, number.textContent);
    console.log("GetOrderDataByNumber 長相", orderData);
    const orderAttractionName = document.getElementById(
      "order-attraction-name"
    );
    orderAttractionName.textContent = orderData.data.trip.attraction.name;
    const orderDate = document.getElementById("order-date");
    orderDate.textContent = orderData.data.trip.date;
    const orderTime = document.getElementById("order-time");
    if (orderData.data.trip.time == "下半天") {
      orderTime.textContent = "下午 2 點到晚上 9 點";
    } else {
      orderTime.textContent = "早上 9 點到下午 4 點";
    }
    const orderAddress = document.getElementById("order-address");
    orderAddress.textContent = orderData.data.trip.attraction.address;
    const orderImage = document.getElementById("order-img");
    orderImage.src = orderData.data.trip.attraction.image;
    const orderPayment = document.getElementById("order-payment");
    const payBtn = document.getElementById("pay-again");
    if (orderData.data.status == 1) {
      orderPayment.textContent = "已付款";
      payBtn.style.display = "none";
    } else {
      orderPayment.textContent = "付款失敗";
      payBtn.style.display = "block";
    }
    const orderAttrctionSection = document.getElementById("order-attraction");
    orderAttrctionSection.style.display = "flex";
  });
});

const profileBtn = document.getElementById("profile-btn");
const orderBtn = document.getElementById("order-btn");
const orderSection = document.getElementById("order-section");
const profileSection = document.getElementById("profile-section");

profileBtn.addEventListener("click", () => {
  orderSection.style.display = "none";
  profileSection.style.display = "block";
});
orderBtn.addEventListener("click", () => {
  profileSection.style.display = "none";
  orderSection.style.display = "block";
});

const signOutBtn = document.getElementById("sign-out-btn");
signOutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

const imageUploadInput = document.getElementById("image-upload");
imageUploadInput.addEventListener("change", () => {
  const file = imageUploadInput.files[0];
  const url = URL.createObjectURL(file);
  document.getElementById("preview").src = url;
});

// async function uploadImage() {
//   const file = imageUploadInput.files[0];
//   const formData = new FormData();
//   formData.append("image", file);

//   let response = await fetch("/upload", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       // "Content-Type": "multipart/form-data",
//     },
//     body: formData,
//   });

//   const data = await response.json();
//   console.log(data);
// }
// const imageCommitBtn = document.getElementById("image-commit-btn");
// imageCommitBtn.onclick = uploadImage;

const updateNameBtn = document.getElementById("update-name-btn");
const updateEmailBtn = document.getElementById("update-email-btn");

[updateNameBtn, updateEmailBtn].forEach((updateBtn) => {
  updateBtn.addEventListener("click", async () => {
    let authData = await fetchAuth(token);
    const updateName = document.getElementById("update-name");
    const updateEmail = document.getElementById("update-email");
    if (!updateName.value && !updateEmail.value) {
      return;
    } else if (
      updateName.value == authData.data.name ||
      updateEmail.value == authData.data.email
    ) {
      return;
    } else {
      const UpdateResultData = updateUserData(
        updateName.value,
        updateEmail.value,
        token
      );
    }
  });
});
