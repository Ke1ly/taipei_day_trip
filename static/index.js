const searchBtn = document.getElementById("search-button");
const template = document.getElementById("attraction-template");
const attractionSection = document.getElementById("attraction-section");
const mrtList = document.getElementById("mrt-list");
const mrtBtns = document.querySelectorAll(".mrt-btn");
const scrollBar = document.getElementById("mrt-list");
const leftArrow = document.getElementById("left-btn");
const rightArrow = document.getElementById("right-btn");

let keyword = null;
let nextPage;
let attractionsData;

// render function -- for attractions
function RenderAttraction() {
  try {
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
    RenderAttraction();
    nextPage = attractionsData["nextPage"];
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
      RenderAttraction();
      nextPage = attractionsData["nextPage"];
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
    for (i = 0; i < mrtData["data"].length; i++) {
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
