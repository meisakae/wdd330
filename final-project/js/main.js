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
  
  try {
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
          <button id="saveFavoriteBtn" class="main-btn">Save to Favorites</button>
          <button id="nutritionBtn" class="main-btn">Show Nutrition Info</button>
          <button id="backBtn" class="main-btn">Back</button>
        </div>
        <div id="nutritionInfo"></div>
      </div>
    `;

    // --- Save to favorites ---
    document.getElementById("saveFavoriteBtn").addEventListener("click", () => {
      saveFavorite(meal);
    });

    // --- Show nutrition info ---
    document.getElementById("nutritionBtn").addEventListener("click", async () => {
      const ingredient = meal.strIngredient1;
      await showNutrition(ingredient);
    });

    // --- Back button ---
    document.getElementById("backBtn").addEventListener("click", () => {
      getRecipesBtn.click();
    });

  } catch (error) {
    console.error("Error fetching meal details:", error);
    recipeContainer.innerHTML = `<p>Error loading meal details.</p>`;
  }
}

// ===== Nutrition Info (Nutritionix API) =====
async function showNutrition(ingredient) {
  const url = "https://trackapi.nutritionix.com/v2/natural/nutrients";

  const appId = "7c80e27c";
  const appKey = "6cf0edf76911cb9a81db1b6be5fb73a4";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-id": appId,
        "x-app-key": appKey
      },
      body: JSON.stringify({ query: ingredient })
    });

    if(!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const food = data.foods && data.foods[0];
    const nutritionDiv = document.getElementById("nutritionInfo");

    if (food) {
      nutritionDiv.innerHTML = `
        <h3>Nutrition Info for ${ingredient}</h3>
        <p><strong>Calories:</strong> ${food.nf_calories} kcal</p>
        <p><strong>Protein:</strong> ${food.nf_protein} g</p>
        <p><strong>Carbs:</strong> ${food.nf_total_carbohydrate} g</p>
        <p><strong>Fat:</strong> ${food.nf_total_fat} g</p>
      `;
    } else {
      nutritionDiv.innerHTML = "<p>No nutrition info found.</p>";
    }
  } catch (error) {
    console.error("Error fetching nutrition:", error);
    document.getElementById("nutritionInfo").innerHTML = "<p>Error loading nutrition info.</p>";
  }
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