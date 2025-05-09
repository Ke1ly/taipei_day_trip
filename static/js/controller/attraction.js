import { GetAttractionDataById, fetchAuth, addBooking } from "../model/api.js";
import {
  RenderAttractionInfo,
  preloadImages,
  RenderAttractionImg,
  renderInit,
} from "../view/render.js";
import {
  initSignUpDialog,
  initSignInDialog,
  initAuthPopup,
  handleAuth,
} from "../controller/common.js";
// get attractionId from the URL
const pathParts = window.location.pathname.split("/");
let attractionId = pathParts[pathParts.length - 1];

initSignUpDialog();
initSignInDialog();
initAuthPopup();

// render the attraction
let attractionData = await GetAttractionDataById(attractionId);
const imageUrlList = attractionData["data"]["images"];
let images = preloadImages(imageUrlList);

RenderAttractionInfo(attractionData);
let imgData = RenderAttractionImg(images);

// render according to auth status
let token = localStorage.getItem("token");
const bookingSubmitBtn = document.getElementById("booking-submit-btn");
handleAuth(token, {
  onSuccess: () => {
    bookingSubmitBtn.onclick = CreateBooking;
  },
  onFailure: () => {
    renderInit([bookingSubmitBtn]);
  },
});

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

function checkDate(bookingDate) {
  const today = new Date();
  const inputDate = new Date(bookingDate.value);
  return inputDate >= today;
}

//create new booking
async function CreateBooking() {
  const bookingDate = document.getElementById("booking-date");
  const bookingTime = document.querySelector('input[name="time-slot"]:checked');
  let bookingPrice;
  if (!bookingDate.value || !bookingTime) {
    alert("請選擇預定時間與日期");
  } else if (!validator.isDate(bookingDate.value)) {
    alert("無此日期");
  } else if (!checkDate(bookingDate)) {
    alert("請選取今天以後的日期");
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
