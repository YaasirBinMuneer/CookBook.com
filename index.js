document.addEventListener("DOMContentLoaded", function () {
    getRecipes();
  });
  
  // Function to fetch recipes from the server
  function getRecipes() {
    fetch('/index')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(recipes => {
        displayRecipes(recipes); // Call the displayRecipes function with fetched data
      })
      .catch(error => console.error("Error fetching recipes:", error));
  }

// Function to dynamically display recipes in the HTML
function displayRecipes(recipes) {
    const container = document.getElementById("recipe-list");
    container.innerHTML = ''; // Clear previous content
  
    recipes.forEach(recipe => {
      // Create recipe card container as a list item
      const cardContainer = document.createElement("li");
      cardContainer.classList.add("recipe-card");
  
      // Recipe title as a heading
      const titleText = document.createElement("h2");
      titleText.textContent = recipe.recipe_name;
      titleText.classList.add("recipe-name-text");
      cardContainer.appendChild(titleText);
  
      // Cuisine and other combined information
      const combinedText = document.createElement("p");
      combinedText.textContent = `Cuisine: ${recipe.cuisine}`;
      combinedText.classList.add("recipe-cuisine-text"); // Corrected class name
      cardContainer.appendChild(combinedText);
  
      // View button to open recipe details
      const viewButton = document.createElement("button");
      viewButton.textContent = "View";
      viewButton.classList.add("view-button");
      viewButton.addEventListener("click", function() {
        openRecipeDetails(recipe);
      });
  
      // Append view button to the card container
      cardContainer.appendChild(viewButton);
  
      // Append recipe card to the container
      container.appendChild(cardContainer);
    });
  }
  
  // Function to open recipe details in a popup or modal
  function openRecipeDetails(recipe) {
    // Populate the details popup with recipe details
    const detailsPopup = document.createElement("div");
    detailsPopup.classList.add("popup");
    detailsPopup.innerHTML = `
      <div class="popup-content">
        <span class="close" onclick="closeRecipeDetails()">&times;</span>
        <h2>${recipe.recipe_name}</h2>
        <div class="recipe-details">
          <p><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
          <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
          <p><strong>Ingredients:</strong></p>
          <ul>
            ${recipe.ingredients.split(', ').map(ingredient => `<li>${ingredient}</li>`).join('')}
          </ul>
          <p><strong>Instructions:</strong></p>
          <p>${recipe.instructions}</p>
        </div>
      </div>
    `;
  
    // Append details popup to the body
    document.body.appendChild(detailsPopup);
  }

    // Function to close recipe details popup
    function closeRecipeDetails() {
        const detailsPopup = document.querySelector(".popup");
        if (detailsPopup) {
          detailsPopup.remove();
        }
      }