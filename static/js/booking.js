const spanUserName = document.getElementById("user-name");
const bookedAttractionName = document.getElementById("booked-attraction-name");
const bookingDate = document.getElementById("booking-date");
const bookingTime = document.getElementById("booking-time");
const bookingPrice = document.getElementById("booking-price");
const bookingAddress = document.getElementById("booking-address");
const totalPrice = document.getElementById("total-price");
const toBookingBtn = document.getElementById("booking-btn");
const authBtn = document.querySelector(".sign-in-or-sign-up");
const bookingImg = document.getElementById("booking-img");
const contactName = document.getElementById("contact-name");
const contactEmail = document.getElementById("contact-email");
const signInDialog = document.querySelector(".sign-in-popup");
const signUpDialog = document.querySelector(".sign-up-popup");
const closeSignInBtn = document.getElementById("close-sign-in-popup");
const closeSignUpBtn = document.getElementById("close-sign-up-popup");
const toSignUpBtn = document.getElementById("to-sign-up");
const toSignInBtn = document.getElementById("to-sign-in");
const signInForm = document.getElementById("sign-in-form");
const signUpForm = document.getElementById("sign-up-form");
const signInSubmitBtn = document.getElementById("sign-in-submit-btn");
const signUpSubmitBtn = document.getElementById("sign-up-submit-btn");
const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");
const deleteBtn = document.getElementById("delete-icon");
const divMain = document.querySelector("main");
const footer = document.querySelector("footer");

let token = localStorage.getItem("token");
let userName;
let userEmail;

renderBooking();

//auth function
function showPopUp() {
  signInResponse.replaceChildren();
  signInForm.reset();
  signInDialog.showModal();
}
function signOut() {
  localStorage.removeItem("token");
  location.reload();
}
async function fetchAuth() {
  try {
    if (token !== null) {
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
      let data = await response.json();
      if (data.data !== null) {
        authBtn.textContent = "登出系統";
        authBtn.onclick = signOut;
        toBookingBtn.addEventListener("click", () => {
          location.reload();
        });
        userName = data.data.name;
        userEmail = data.data.email;
      } else {
        authBtn.textContent = "登入/註冊";
        authBtn.onclick = showPopUp;
        toBookingBtn.onclick = showPopUp;
        location.replace("/");
      }
    } else {
      authBtn.textContent = "登入/註冊";
      authBtn.onclick = showPopUp;
      toBookingBtn.onclick = showPopUp;
      location.replace("/");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

//render booking page
async function renderBooking() {
  fetchAuth();
  let response = await fetch("/api/booking", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  let data = await response.json();
  if (!data.data) {
    spanUserName.textContent = userName;
    let newP = document.createElement("p");
    newP.textContent = "目前沒有任何待預訂的行程";
    newP.classList.add("no-booking");
    divMain.replaceChildren(newP);
    footer.classList.add("no-booking");
  } else {
    spanUserName.textContent = userName;
    bookedAttractionName.textContent = data.data.attraction.name;
    bookingDate.textContent = data.data.date;
    if (data.data.time == "上半天") {
      bookingTime.textContent = "早上 9 點到下午 4 點";
    } else {
      bookingTime.textContent = "下午 2 點到晚上 9 點";
    }
    bookingPrice.textContent = data.data.price;
    totalPrice.textContent = data.data.price;
    bookingAddress.textContent = data.data.attraction.address;
    bookingImg.setAttribute("src", data.data.attraction.image);
    contactName.value = userName;
    contactEmail.value = userEmail;
  }
}

//delete booking
deleteBtn.onclick = deleteBooking;
async function deleteBooking() {
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
  let data = await response.json();
  if (data.ok) {
    location.reload();
  }
}

//sign up submit
signUpSubmitBtn.addEventListener("click", () => signUp());
async function signUp(name, email, password) {
  name = document.getElementById("sign-up-name").value;
  email = document.getElementById("sign-up-email").value;
  password = document.getElementById("sign-up-pwd").value;
  let response = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "註冊時發生錯誤");
  }
  response = await response.json();
  if (response.error) {
    signUpResponse.textContent = response.message;
    signUpResponse.style.color = "red";
    signUpResponse.style.marginBottom = "10px";
  } else {
    signUpResponse.textContent = "註冊成功，請登入系統";
    signUpResponse.style.color = "green";
    signUpResponse.style.marginBottom = "10px";
  }
}

//sign in submit
signInSubmitBtn.addEventListener("click", () => signIn());
async function signIn(email, password) {
  email = document.getElementById("sign-in-email").value;
  password = document.getElementById("sign-in-pwd").value;
  let response = await fetch("/api/user/auth", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  if (!response.ok) {
    let errorData = await response.json();
    throw new Error(errorData.message || "註冊時發生錯誤");
  }
  response = await response.json();
  if (response.error) {
    signInResponse.textContent = response.message;
    signInResponse.style.color = "red";
    signInResponse.style.marginBottom = "10px";
  } else {
    signInResponse.replaceChildren();
    localStorage.setItem("token", response.token);
    location.reload();
  }
}

// pop-up dialog control
authBtn.onclick = showPopUp;
closeSignInBtn.addEventListener("click", () => {
  signInDialog.close();
});
toSignUpBtn.addEventListener("click", () => {
  if (signUpForm) {
    signUpForm.reset();
  }
  signUpResponse.replaceChildren();
  signUpDialog.showModal();
});
closeSignUpBtn.addEventListener("click", () => {
  signInDialog.close();
  signUpDialog.close();
});
toSignInBtn.addEventListener("click", () => {
  signInForm.reset();
  signInResponse.replaceChildren();
  signUpDialog.close();
});
