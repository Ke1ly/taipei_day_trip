import {
  GetAttractionDataById,
  signUp,
  fetchAuth,
  signIn,
  addBooking,
} from "../model/api.js";
import {
  RenderAttractionInfo,
  RenderAttractionImg,
  renderAuth,
  renderInit,
  renderSignMessage,
} from "../view/render.js";

const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");

// get attractionId from the URL
const pathParts = window.location.pathname.split("/");
let attractionId = pathParts[pathParts.length - 1];

// render the attraction
let attractionData = await GetAttractionDataById(attractionId);
RenderAttractionInfo(attractionData);
let imgData = RenderAttractionImg(attractionData);

// render according to auth status
let token = localStorage.getItem("token");
const bookingSubmitBtn = document.getElementById("booking-submit-btn");
if (token !== null) {
  let authData = await fetchAuth(token);

  if (authData.data !== null) {
    renderAuth();
    bookingSubmitBtn.onclick = CreateBooking;
  } else {
    renderInit([bookingSubmitBtn]);
  }
} else {
  renderInit([bookingSubmitBtn]);
}

// show price based on the selected time slot
const timeSlotForm = document.getElementById("time-slot");
const price = document.getElementById("price");
const forenoonTimeSlot = document.getElementById("forenoon");
timeSlotForm.addEventListener("change", () => {
  if (forenoonTimeSlot.checked) {
    price.textContent = "新台幣 2000 元";
  } else {
    price.textContent = "新台幣 2500 元";
  }
});

// image slideshow controller
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
nextBtn.addEventListener("click", () =>
  changeSlide(1, imgData.slides, imgData.indicators)
);
prevBtn.addEventListener("click", () =>
  changeSlide(-1, imgData.slides, imgData.indicators)
);
let currentIndex = 0;
function changeSlide(direction, slides, indicators) {
  try {
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i == currentIndex);
    });
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i == currentIndex);
    });
  } catch (error) {
    console.error("切換圖片時發生錯誤:", error);
  }
}

//sign up submit
const signUpSubmitBtn = document.getElementById("sign-up-submit-btn");
signUpSubmitBtn.addEventListener("click", async () => {
  let signUpData = await signUp();
  if (signUpData.error) {
    renderSignMessage(signUpResponse, signUpData.message, "red");
  } else {
    renderSignMessage(signUpResponse, "註冊成功，請登入系統", "green");
  }
});

//sign in submit
const signInSubmitBtn = document.getElementById("sign-in-submit-btn");
signInSubmitBtn.addEventListener("click", async () => {
  let signInData = await signIn();
  if (signInData.error) {
    renderSignMessage(signInResponse, signInData.message, "red");
  } else {
    signInResponse.replaceChildren();
    localStorage.setItem("token", signInData.token);
    location.reload();
  }
});

// pop-up dialog controller
const signUpDialog = document.querySelector(".sign-up-popup");
const signInDialog = document.querySelector(".sign-in-popup");

const closeSignInBtn = document.getElementById("close-sign-in-popup");
closeSignInBtn.addEventListener("click", () => {
  signInDialog.close();
});

const toSignUpBtn = document.getElementById("to-sign-up");
toSignUpBtn.addEventListener("click", () => {
  const signUpForm = document.getElementById("sign-up-form");
  if (signUpForm) {
    signUpForm.reset();
  }
  signUpResponse.replaceChildren();
  signUpDialog.showModal();
});

const closeSignUpBtn = document.getElementById("close-sign-up-popup");
closeSignUpBtn.addEventListener("click", () => {
  signInDialog.close();
  signUpDialog.close();
});

const toSignInBtn = document.getElementById("to-sign-in");
toSignInBtn.addEventListener("click", () => {
  const signInForm = document.getElementById("sign-in-form");
  signInForm.reset();
  signInResponse.replaceChildren();
  signUpDialog.close();
});

//create new booking
async function CreateBooking() {
  const bookingDate = document.getElementById("booking-date");
  const bookingTime = document.querySelector('input[name="time-slot"]:checked');
  let bookingPrice;
  if (!bookingDate || !bookingTime) {
    alert("請選擇預定時間與日期");
  } else {
    if (bookingTime.value == "下半天") {
      bookingPrice = 2500;
    } else {
      bookingPrice = 2000;
    }
    let addBookingData = await addBooking(
      token,
      attractionId,
      bookingDate.value,
      bookingTime.value,
      bookingPrice
    );
    if (addBookingData.error) {
      alert(addBookingData.message);
    } else {
      location.replace("/booking");
    }
  }
}
