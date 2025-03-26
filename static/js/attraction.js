const attractionName = document.getElementById("attraction-name");
const attractionCategory = document.getElementById("attraction-category");
const attractionDescription = document.getElementById("attraction-description");
const attractionAddress = document.getElementById("attraction-address");
const attractionTransport = document.getElementById("attraction-transport");
const timeSlotForm = document.getElementById("time-slot");
const price = document.getElementById("price");
const forenoonTimeSlot = document.getElementById("forenoon");
const imgSection = document.getElementById("attraction-images");
const indicatorsDiv = imgSection.querySelector(".indicators");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
let attractionData;
let slides = [];
let indicators = [];
let currentIndex = 0;

// get attractionId from the URL
const pathParts = window.location.pathname.split("/");
let attractionId = pathParts[pathParts.length - 1];

// render the attraction
async function GetAttractionDataById(attractionId) {
  try {
    let response = await fetch(`/api/attraction/${attractionId}`, {
      method: "GET",
    });
    if (!response.ok) {
      let errorData = await response.json();
      throw new Error(errorData.message || "取得資料時發生錯誤");
    }
    attractionData = await response.json();
    RenderAttractionInfo();
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}
GetAttractionDataById(attractionId);

// render function -- for the attraction
function RenderAttractionInfo() {
  try {
    attractionName.textContent = attractionData["data"]["name"];
    attractionCategory.textContent = `${attractionData["data"]["category"]} at ${attractionData["data"]["mrt"]}`;
    attractionDescription.textContent = attractionData["data"]["description"];
    attractionAddress.textContent = attractionData["data"]["address"];
    attractionTransport.textContent = attractionData["data"]["transport"];
    for (let i = 0; i < attractionData["data"]["images"].length; i++) {
      let img = document.createElement("img");
      img.classList.add("slide");
      img.src = attractionData["data"]["images"][i];
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
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

// show price based on the selected time slot
timeSlotForm.addEventListener("change", () => {
  if (forenoonTimeSlot.checked) {
    price.textContent = "新台幣 2000 元";
  } else {
    price.textContent = "新台幣 2500 元";
  }
});

// image slideshow effect
nextBtn.addEventListener("click", () => changeSlide(1));
prevBtn.addEventListener("click", () => changeSlide(-1));
function changeSlide(direction) {
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
