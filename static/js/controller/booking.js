import {
  signUp,
  fetchAuth,
  signIn,
  deleteBooking,
  addOrder,
  getBooking,
} from "../model/api.js";
import {
  renderAuth,
  renderSignMessage,
  renderNoBooking,
  renderBooking,
} from "../view/render.js";

const signUpResponse = document.getElementById("sign-up-response");
const signInResponse = document.getElementById("sign-in-response");

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

//render booking page
(async () => {
  let authData = await fetchAuth(token);
  let userName = authData.data.name;
  let userEmail = authData.data.email;
  let bookingData = await getBooking(token);
  if (!bookingData.data) {
    renderNoBooking(userName);
  } else {
    renderBooking(bookingData, userName, userEmail);
  }
})();

//delete booking
const deleteBtn = document.getElementById("delete-icon");
deleteBtn.addEventListener("click", async () => {
  let deleteBookingData = await deleteBooking(token);
  if (deleteBookingData.ok) {
    location.reload();
  }
});

//pay for the booking
TPDirect.setupSDK(
  159796,
  "app_E5sa5WaRAVSl0Exs69Xe8dzBIp3xfuCxef6gmcY7XyKtjIDSPkRcwoQOdG1z",
  "sandbox"
);

let fields = {
  number: {
    element: "#card-number",
    placeholder: "**** **** **** ****",
  },
  expirationDate: {
    element: document.getElementById("card-expiration-date"),
    placeholder: "MM / YY",
  },
  ccv: {
    element: "#card-ccv",
    placeholder: "CCV",
  },
};

TPDirect.card.setup({
  fields: fields,
  styles: {
    input: {
      color: "gray",
    },
    ":focus": {
      color: "black",
    },
    ".valid": {
      color: "green",
    },
    ".invalid": {
      color: "red",
    },
  },
  isMaskCreditCardNumber: true,
  maskCreditCardNumberRange: {
    beginIndex: 6,
    endIndex: 11,
  },
});

TPDirect.card.onUpdate(function (update) {
  if (update.canGetPrime) {
    payBtn.removeAttribute("disabled");
    payBtn.style.backgroundColor = "#448899";
    payBtn.style.cursor = "pointer";
  } else {
    payBtn.setAttribute("disabled", true);
    payBtn.style.backgroundColor = "grey";
    payBtn.style.cursor = "default";
  }
});

async function getPrime() {
  return new Promise((resolve, reject) => {
    const tappayStatus = TPDirect.card.getTappayFieldsStatus();
    if (tappayStatus.canGetPrime === false) {
      return reject({
        msg: "請填寫所有卡片欄位，並確認填寫正確",
        error: "cannot get prime",
      });
    }
    TPDirect.card.getPrime((result) => {
      if (result.status !== 0) {
        return reject({
          msg: "付款時發生錯誤，請重試一遍，或聯繫客服",
          error: result.msg,
        });
      }
      resolve(result.card.prime);
    });
  });
}

const payBtn = document.getElementById("order-n-pay");
payBtn.addEventListener("click", async () => {
  const name = document.getElementById("contact-name");
  const email = document.getElementById("contact-email");
  const phone = document.getElementById("contact-phone");
  if (!phone.value || !email.value || !name.value) {
    alert("請填寫所有聯絡資訊");
  } else {
    try {
      const prime = await getPrime();
      let bookingData = await getBooking(token);
      delete bookingData.data.price;
      let addOrderData = await addOrder(
        token,
        prime,
        bookingData,
        name,
        email,
        phone
      );
      alert(addOrderData.data.payment.message);
      deleteBooking(token);
      let order_number = addOrderData.data.number;
      location.replace(`/thankyou?number=${order_number}`);
    } catch (error) {
      alert(error.error, error.msg);
    }
  }
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
