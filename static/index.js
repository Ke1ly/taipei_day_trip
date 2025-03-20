let nextPage;
let attractionsData;
const template = document.getElementById("attraction-template");
const attractionSection = document.getElementById("attraction-section");

async function showAttractions(page) {
  // 依照 page 取得 attraction data
  let response = await fetch(`/api/attractions?page=${page}`, {
    method: "GET",
  });
  attractionsData = await response.json();
  RenderAttraction();
  nextPage = attractionsData["nextPage"];
}

function RenderAttraction() {
  // 針對每筆  attraction data 進行渲染
  for (i = 0; i < attractionsData["data"].length; i++) {
    let attractionItem = template.content.cloneNode(true);
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
}
showAttractions(0);

//=========================================================
// 依據 keyword 搜尋與渲染景點
let searchBtn = document.getElementById("search-button");
searchBtn.onclick = async function showAttractionsByKeyword() {
  let keyword = document.getElementById("keyword").value;
  let response = await fetch(`/api/attractions?keyword=${keyword}`, {
    method: "GET",
  });
  attractionsData = await response.json();
  attractionSection.textContent = "";
  RenderAttraction();
  nextPage = attractionsData["nextPage"];
};

//=========================================================
// 渲染 MRT scroll bar 內容
async function RenderMRT() {
  let response = await fetch(`/api/mrts`, {
    method: "GET",
  });
  let mrtData = await response.json();

  const template = document.getElementById("mrt-template");
  const mrtList = document.getElementById("mrt-list");
  for (i = 0; i < mrtData["data"].length; i++) {
    const mrtButton = template.content.cloneNode(true).children[0];
    mrtButton.textContent = mrtData["data"][i];
    mrtList.appendChild(mrtButton);
  }
}
RenderMRT();
// MRT scroll bar 左右按鈕效果
const scrollBar = document.getElementById("mrt-list");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const scrollAmount = 200;
leftBtn.addEventListener("click", () => {
  scrollBar.scrollBy({ left: -scrollAmount, behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  scrollBar.scrollBy({ left: scrollAmount, behavior: "smooth" });
});

// MRT-btn 依據 MRT 搜尋與渲染景點
window.onload = () => {
  mrtBtns = document.querySelectorAll(".mrt-btn");
  mrtBtns.forEach((mrtBtn) => {
    mrtBtn.onclick = async function showAttractionsByMRT() {
      let response = await fetch(
        `/api/attractions?keyword=${mrtBtn.textContent}`,
        {
          method: "GET",
        }
      );
      attractionsData = await response.json();
      attractionSection.textContent = "";
      RenderAttraction();
      nextPage = attractionsData["nextPage"];
    };
  });
};

//=========================================================
// 自動載入
const observerTarget = document.getElementById("observer-target");
observerTarget.style.height = "1px"; // 設定高度
let isFetching = false; // 避免重複請求

const observer = new IntersectionObserver(
  async (entries) => {
    if (entries[0].isIntersecting && !isFetching && nextPage != null) {
      isFetching = true;
      await showAttractions(nextPage);
      isFetching = false;
    }
  },
  { rootMargin: "0px", threshold: 0 }
);
observer.observe(observerTarget);

//=========================================================
let leftArrow = document.getElementById("left-btn");
leftArrow.addEventListener("mouseover", function () {
  this.src = "/static/img/left-arrow-hovered.png";
});
leftArrow.addEventListener("mouseout", function () {
  this.src = "/static/img/left-arrow.png";
});
let rightArrow = document.getElementById("right-btn");
rightArrow.addEventListener("mouseover", function () {
  this.src = "/static/img/right-arrow-hovered.png";
});
rightArrow.addEventListener("mouseout", function () {
  this.src = "/static/img/right-arrow.png";
});
