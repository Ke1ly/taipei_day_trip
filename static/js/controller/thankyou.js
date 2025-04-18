import {
  signUp,
  fetchAuth,
  signIn,
  GetOrderDataByNumber,
} from "../model/api.js";

import {
  renderAuth,
  renderSignMessage,
  renderOrderSuccess,
} from "../view/render.js";

const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");

// get order_number from the URL
const params = new URLSearchParams(window.location.search);
const number = params.get("number");

// render according to auth status
let token = localStorage.getItem("token");
if (token !== null) {
  let authData = await fetchAuth(token);
  if (authData.data !== null) {
    renderAuth();
  } else {
    location.replace("/");
  }
} else {
  location.replace("/");
}

// render order result
let orderData = await GetOrderDataByNumber(token, number);
renderOrderSuccess(orderData);

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
