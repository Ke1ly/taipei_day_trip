import {
  getMRT,
  getAttractions,
  getAttractionsBySearch,
} from "../model/api.js";
import {
  renderAuth,
  renderInit,
  renderMRT,
  renderAttractions,
} from "../view/render.js";
import {
  initSignUpDialog,
  initSignInDialog,
  initAuthPopup,
  handleAuth,
} from "../controller/common.js";

let nextPage;

initSignUpDialog();
initSignInDialog();
initAuthPopup();

// render according to auth status
let token = localStorage.getItem("token");
handleAuth(token, {
  onFailure: () => {
    renderInit([]);
  },
});

// render attractions
async function showAttractions(page) {
  let keyword = document.getElementById("keyword").value;
  let attractionsData;
  const attractionSection = document.getElementById("attraction-section");
  if (!keyword) {
    attractionsData = await getAttractions(page);
  } else {
    if (page == 0) {
      attractionSection.replaceChildren();
    }
    attractionsData = await getAttractionsBySearch(page);
  }
  if (attractionsData) {
    renderAttractions(attractionsData);
    nextPage = attractionsData["nextPage"];
  }
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
