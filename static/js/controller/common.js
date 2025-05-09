import { renderSignMessage, renderAuth } from "../view/render.js";
import { signUp, signIn, fetchAuth } from "../model/api.js";

const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");
const signUpDialog = document.querySelector(".sign-up-popup");
const signInDialog = document.querySelector(".sign-in-popup");
const signInForm = document.getElementById("sign-in-form");
const signUpForm = document.getElementById("sign-up-form");

export function initSignUpDialog() {
  const signUpSubmitBtn = document.getElementById("sign-up-submit-btn");
  const signUpResponse = document.getElementById("sign-up-response");

  signUpSubmitBtn.addEventListener("click", async () => {
    const name = document.getElementById("sign-up-name");
    const email = document.getElementById("sign-up-email");
    const password = document.getElementById("sign-up-pwd");
    if (!name.value || !email.value || !password.value) {
      renderSignMessage(signUpResponse, "請填打所有欄位", "red");
    } else if (!validator.isEmail(email.value)) {
      renderSignMessage(signUpResponse, "Email 格式有誤", "red");
    } else if (!validator.isLength(password.value, { min: 6, max: 12 })) {
      renderSignMessage(signUpResponse, "請輸入長度 6-12 字的密碼", "red");
    } else {
      let signUpData = await signUp(name, email, password);
      if (signUpData.error) {
        renderSignMessage(signUpResponse, signUpData.message, "red");
      } else {
        renderSignMessage(signUpResponse, "註冊成功，請登入系統", "green");
      }
    }
  });
}

export function initSignInDialog() {
  const signInSubmitBtn = document.getElementById("sign-in-submit-btn");
  const signInResponse = document.getElementById("sign-in-response");

  signInSubmitBtn.addEventListener("click", async () => {
    const email = document.getElementById("sign-in-email");
    const password = document.getElementById("sign-in-pwd");
    if (!email.value || !password.value) {
      renderSignMessage(signInResponse, "請填打所有欄位!", "red");
    } else if (!validator.isEmail(email.value)) {
      renderSignMessage(signInResponse, "Email 格式有誤", "red");
    } else if (!validator.isLength(password.value, { min: 6, max: 12 })) {
      renderSignMessage(signInResponse, "密碼長度應為 6-12 字", "red");
    } else {
      let signInData = await signIn(email, password);
      if (signInData.error) {
        renderSignMessage(signInResponse, signInData.message, "red");
      } else {
        signInResponse.replaceChildren();
        localStorage.setItem("token", signInData.token);
        location.reload();
      }
    }
  });
}

function closeSignIn() {
  signInDialog.classList.remove("show");
  signInDialog.close();
}

function closeSignUp() {
  signInDialog.classList.remove("show");
  signInDialog.close();
  signUpDialog.close();
}

function openSignUp() {
  if (signUpForm) {
    signUpForm.reset();
  }
  signUpResponse.replaceChildren();
  signUpDialog.showModal();
}

function openSignIn() {
  signInForm.reset();
  signInResponse.replaceChildren();
  signUpDialog.close();
}

function initAuthPopup() {
  document
    .getElementById("close-sign-in-popup")
    .addEventListener("click", closeSignIn);
  document.getElementById("to-sign-up").addEventListener("click", openSignUp);
  document
    .getElementById("close-sign-up-popup")
    .addEventListener("click", closeSignUp);
  document.getElementById("to-sign-in").addEventListener("click", openSignIn);
}

export { initAuthPopup };

export async function handleAuth(token, { onSuccess, onFailure }) {
  if (token !== null ) {
    let authData = await fetchAuth(token);
    if (authData.data !== null) {
      renderAuth();
      if (onSuccess) {
        onSuccess(authData);
      }
    } else {
      if (onFailure) {
        onFailure();
      } else {
        location.replace("/");
      }
    }
  } else {
    if (onFailure) {
      onFailure();
    } else {
      location.replace("/");
    }
  }
}
