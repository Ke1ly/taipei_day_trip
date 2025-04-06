const searchBtn = document.getElementById("search-button");
const template = document.getElementById("attraction-template");
const attractionSection = document.getElementById("attraction-section");
const mrtList = document.getElementById("mrt-list");
const mrtBtns = document.querySelectorAll(".mrt-btn");
const scrollBar = document.getElementById("mrt-list");
const leftArrow = document.getElementById("left-btn");
const rightArrow = document.getElementById("right-btn");
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

let keyword = null;
let nextPage;
let attractionsData;
let name;
let email;
let password;

// render function -- for attractions
function renderAttraction() {
  try {
    for (let i = 0; i < attractionsData["data"].length; i++) {
      let attractionItem = template.content.cloneNode(true);
      let attractionA = attractionItem.querySelector("a");
      attractionA.href = `/attraction/${attractionsData["data"][i]["id"]}`;

      // 渲染img
      let attractionImg = attractionItem.querySelector("img");
      let imgURL = attractionsData["data"][i]["images"][0];
      attractionImg.src = imgURL;
      attractionImg.alt = attractionsData["data"][i]["name"] + "的圖片";

      // 渲染name
      let attractionName = attractionItem.querySelector("figcaption");
      attractionName.textContent = attractionsData["data"][i]["name"];

      // 渲染category
      let div = attractionItem.querySelector("div");
      let attractionCategory = div.querySelector(".attraction-category");
      attractionCategory.textContent = attractionsData["data"][i]["category"];

      //渲染 mrt
      let attractionMRT = div.querySelector(".attraction-mrt");
      attractionMRT.textContent = attractionsData["data"][i]["mrt"];

      // 掛載至畫面上
      attractionSection.appendChild(attractionItem);
    }
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

// render all attractions
async function showAttractions(page) {
  try {
    let response = await fetch(`/api/attractions?page=${page}`, {
      method: "GET",
    });
    if (!response.ok) {
      let errorData = await response.json();
      throw new Error(errorData.message || "取得資料時發生錯誤");
    }
    attractionsData = await response.json();
    renderAttraction();
    nextPage = attractionsData["nextPage"];
    fetchAuth();
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}

showAttractions(0);

// render attractions by keyword searching
async function showAttractionsByKeyword(page) {
  try {
    keyword = document.getElementById("keyword").value;
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
    attractionsData = await response.json();
    if (attractionsData["data"] == null) {
      attractionSection.replaceChildren();
    } else {
      if (page == 0) {
        attractionSection.replaceChildren();
      }
      renderAttraction();
      nextPage = attractionsData["nextPage"];
      fetchAuth();
    }
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}
searchBtn.addEventListener("click", () => showAttractionsByKeyword(0));

// render attractions by MRT-btn onclicking
async function showAttractionsByMRT(mrtBtn, page) {
  document.getElementById("keyword").value = mrtBtn;
  showAttractionsByKeyword(page);
}

// render MRT scroll bar
async function RenderMRT() {
  try {
    let response = await fetch(`/api/mrts`, {
      method: "GET",
    });
    if (!response.ok) {
      let errorData = await response.json();
      throw new Error(errorData.message || "取得資料時發生錯誤");
    }
    let mrtData = await response.json();

    const template = document.getElementById("mrt-template");
    for (let i = 0; i < mrtData["data"].length; i++) {
      const mrtButton = template.content.cloneNode(true).children[0];
      mrtButton.textContent = mrtData["data"][i];
      mrtButton.addEventListener("click", () =>
        showAttractionsByMRT(mrtButton.textContent, 0)
      );
      mrtList.appendChild(mrtButton);
    }
  } catch (error) {
    console.error("渲染網頁時發生錯誤", error);
  }
}
RenderMRT();

// left and right arrow feature in MRT scroll bar
leftArrow.addEventListener("click", () => {
  scrollBar.scrollBy({ left: -200, behavior: "smooth" });
});

rightArrow.addEventListener("click", () => {
  scrollBar.scrollBy({ left: 200, behavior: "smooth" });
});

leftArrow.addEventListener("mouseover", function () {
  this.src = "/static/img/left-arrow-hovered.png";
});
leftArrow.addEventListener("mouseout", function () {
  this.src = "/static/img/left-arrow.png";
});
rightArrow.addEventListener("mouseover", function () {
  this.src = "/static/img/right-arrow-hovered.png";
});
rightArrow.addEventListener("mouseout", function () {
  this.src = "/static/img/right-arrow.png";
});

// autoload feature
const observerTarget = document.getElementById("observer-target");
observerTarget.style.height = "1px";
let isFetching = false;

const observer = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting && !isFetching && nextPage != null) {
    isFetching = true;
    if (keyword == null) {
      await showAttractions(nextPage);
    } else {
      await showAttractionsByKeyword(nextPage);
    }
    isFetching = false;
  }
});
observer.observe(observerTarget);

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
  signUpForm.reset();
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
