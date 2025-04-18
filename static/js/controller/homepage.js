import {
  signUp,
  fetchAuth,
  signIn,
  getMRT,
  getAttractions,
  getAttractionsBySearch,
} from "../model/api.js";
import {
  renderAuth,
  renderInit,
  renderSignMessage,
  renderMRT,
  renderAttractions,
} from "../view/render.js";

const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");
let nextPage;

// render according to auth status
let token = localStorage.getItem("token");
if (token !== null) {
  let authData = await fetchAuth(token);
  if (authData.data !== null) {
    renderAuth();
  } else {
    renderInit([]);
  }
} else {
  renderInit([]);
}

// render attractions
async function showAttractions(page) {
  let keyword = document.getElementById("keyword").value;
  let attractionsData;
  const attractionSection = document.getElementById("attraction-section");
  if (keyword == null) {
    attractionsData = await getAttractions(page);
  } else {
    if (page == 0) {
      attractionSection.replaceChildren();
    }
    attractionsData = await getAttractionsBySearch(page);
  }
  renderAttractions(attractionsData);
  nextPage = attractionsData["nextPage"];
}
showAttractions(0);

const searchBtn = document.getElementById("search-button");
searchBtn.addEventListener("click", () => showAttractions(0));

// autoload feature
const observer = new IntersectionObserver(async (entries) => {
  let isFetching = false;
  if (entries[0].isIntersecting && !isFetching && nextPage != null) {
    isFetching = true;
    await showAttractions(nextPage);
    isFetching = false;
  }
});
observer.observe(document.getElementById("observer-target"));

// render MRT scroll bar
(async () => {
  let mrtData = await getMRT();
  renderMRT(mrtData);
  const mrtBtns = document.querySelectorAll(".mrt-btn");
  mrtBtns.forEach((mrtBtn) => {
    mrtBtn.addEventListener("click", () => {
      document.getElementById("keyword").value = mrtBtn.textContent;
      showAttractions(0);
    });
  });
})();

// MRT scroll bar controller
const scrollBar = document.getElementById("mrt-list");
const leftArrow = document.getElementById("left-btn");
const rightArrow = document.getElementById("right-btn");

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

// pop-up dialog control
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
