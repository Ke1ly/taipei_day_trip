import {
  fetchAuth,
  deleteBooking,
  addOrder,
  getBooking,
} from "../model/api.js";
import { renderNoBooking, renderBooking } from "../view/render.js";
import { handleAuth } from "../controller/common.js";

// render according to auth status
let token = localStorage.getItem("token");
handleAuth(token, {});

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
  } else if (!validator.isMobilePhone(phone.value)) {
    alert("請輸入正確手機號碼");
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
      alert(`付款結果：${addOrderData.data.payment.message}`);
      deleteBooking(token);
      let order_number = addOrderData.data.number;
      location.replace(`/thankyou?number=${order_number}`);
    } catch (error) {
      alert(error.msg);
    }
  }
});
