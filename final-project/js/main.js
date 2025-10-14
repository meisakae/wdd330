// --- ページ読み込み時に実行 ---
window.onload = function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  console.log("Page loading successfully");
};

// Elements
const getRecipesBtn = document.getElementById("getRecipesBtn");
const nutrientDropdown = document.getElementById("nutrientDropdown");
const recipeContainer = document.getElementById("recipeContainer");
const recipeTemplate = document.getElementById("recipeTemplate");
const showFavoritesBtn = document.getElementById("showFavoritesBtn");

const search = {
  carbs: ["rice", "bread", "pasta"],
  protein: ["chicken", "beef", "tofu", "fish"],
  fat: ["avocado", "nuts", "butter"],
  vitamin: ["carrot", "broccoli", "strawberry"],
  mineral: ["beans", "yogurt", "almonds"]
};

function displayMessage(msg) {
  alert(msg);
}

// ===== Fetch Recipes =====
getRecipesBtn.addEventListener("click", async function () {
  const nutrient = nutrientDropdown.value;
  if (!nutrient) return displayMessage("Please choose a nutrient!");
  saveLastSelection(nutrient);

  const items = search[nutrient];
  const query = items[Math.floor(Math.random() * items.length)];
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

  this.textContent = "Loading...";
  try {
    const response = await fetch(url);
    const data = await response.json();
    recipeContainer.innerHTML = "";

    if (!data.meals) {
      recipeContainer.innerHTML = `<p>No recipes found for ${nutrient}.</p>`;
      return;
    }

    data.meals.forEach(meal => {
      const clone = recipeTemplate.content.cloneNode(true);
      clone.querySelector(".meal-name").textContent = meal.strMeal;
      const img = clone.querySelector(".meal-img");
      img.src = meal.strMealThumb;
      img.alt = meal.strMeal;

      clone.querySelector(".recipe-card").addEventListener("click", () => {
        showMealDetails(meal.idMeal);
      });
      recipeContainer.appendChild(clone);
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    recipeContainer.innerHTML = `<p>Error loading recipes.</p>`;
  } finally {
    setTimeout(() => { this.textContent = "Show Recipes"; }, 1000);
  }
});

// ===== Meal Details =====
async function showMealDetails(mealId) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
  const response = await fetch(url);
  const data = await response.json();
  const meal = data.meals[0];

  recipeContainer.innerHTML = `
    <div class="meal-details">
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" width="250">
      <p><strong>Area:</strong> ${meal.strArea}</p>
      <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
      <div class="detail-buttons">
        <button id="saveFavoriteBtn" class="main-btn"> Save to Favorites </button>
        <button id="backBtn" class="main-btn"> ⬅ Back </button>
      </div>
    </div>
  `;

  document.getElementById("saveFavoriteBtn").addEventListener("click", () => saveFavorite(meal));
  document.getElementById("backBtn").addEventListener("click", () => getRecipesBtn.click());
}

// ===== お気に入り　保存機能 =====
function saveFavorite(meal) {
  const key = "favorites_v1";
  const current = JSON.parse(localStorage.getItem(key)) || [];
  if (current.some(m => m.idMeal === meal.idMeal)) {
    displayMessage("This recipe is already saved to favorites.");
    return;
  }
  current.push({ idMeal: meal.idMeal, title: meal.strMeal, thumb: meal.strMealThumb });
  localStorage.setItem(key, JSON.stringify(current));
  displayMessage("Saved to favorites!");
}

function displayFavorites() {
  const key = "favorites_v1";
  const current = JSON.parse(localStorage.getItem(key)) || [];
  recipeContainer.innerHTML = `<div class="meal-details"><h2>Your Favorites</h2></div>`;
  const container = recipeContainer.querySelector(".meal-details");

  if (current.length === 0) {
    container.innerHTML += `<p>No favorites yet.</p>`;
    return;
  }

  const list = document.createElement("ul");
  list.classList.add("fav-list");
  container.appendChild(list);

  current.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${item.thumb}" alt="${item.title}">
      <div>${item.title}</div>
      <div class="fav-actions">
        <button class="main-btn fav-open" data-id="${item.idMeal}">Open</button>
        <button class="main-btn fav-remove" data-id="${item.idMeal}">Remove</button>
      </div>
    `;
    list.appendChild(li);
  });

  list.addEventListener("click", (e) => {
    const btn = e.target;
    if (btn.classList.contains("fav-open")) {
      const id = btn.dataset.id;
      showMealDetails(id);
    } else if (btn.classList.contains("fav-remove")) {
      const id = btn.dataset.id;
      removeFavorite(id);
      displayFavorites();
    }
  });
}

function removeFavorite(idMeal) {
  const key = "favorites_v1";
  const current = JSON.parse(localStorage.getItem(key)) || [];
  const filtered = current.filter(m => m.idMeal !== idMeal);
  localStorage.setItem(key, JSON.stringify(filtered));
  displayMessage("Removed from favorites.");
}

if (showFavoritesBtn) {
  showFavoritesBtn.addEventListener("click", displayFavorites);
}

function saveLastSelection(nutrient) {
  localStorage.setItem("lastNutrient", nutrient);
}
function loadLastSelection() {
  const last = localStorage.getItem("lastNutrient");
  if (last && nutrientDropdown) {
    nutrientDropdown.value = last;
  }
}
loadLastSelection();