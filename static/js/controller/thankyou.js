import { GetOrderDataByNumber } from "../model/api.js";
import { renderOrderSuccess } from "../view/render.js";
import { handleAuth } from "../controller/common.js";

// get order_number from the URL
const params = new URLSearchParams(window.location.search);
const number = params.get("number");

// render according to auth status
let token = localStorage.getItem("token");
handleAuth(token, {});

// render order result
let orderData = await GetOrderDataByNumber(token, number);
renderOrderSuccess(orderData);
