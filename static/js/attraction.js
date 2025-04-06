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
const authBtn = document.querySelector(".sign-in-or-sign-up");
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
let attractionData;
let slides = [];
let indicators = [];
let currentIndex = 0;
let name;
let email;
let password;

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
    fetchAuth();
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

//auth function for required pages
let token = localStorage.getItem("token");
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
      } else {
        authBtn.textContent = "登入/註冊";
        authBtn.onclick = showPopUp;
      }
    } else {
      authBtn.textContent = "登入/註冊";
      authBtn.onclick = showPopUp;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
