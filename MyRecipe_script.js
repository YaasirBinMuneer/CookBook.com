document.addEventListener("DOMContentLoaded", function () {
    closeDeletePopup();
    closeViewPopup();
    closeEditPopup();
    closeAddPopup();
  });
  
  
  // Function to fetch recipes from the server
  function getRecipes() {
    fetch('/myRecipes')
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

        // Recipe title as normal text
        const titleText = document.createElement("p");
        titleText.textContent = recipe.recipe_name;
        titleText.classList.add("recipe-name-text");
        cardContainer.appendChild(titleText);

        // View button to open recipe details
        const viewButton = document.createElement("button");
        viewButton.textContent = "View";
        viewButton.classList.add("view-button");
        viewButton.addEventListener("click", function () {
            openViewPopup(recipe);
        });

        // Edit button to open edit popup
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-button");
        editButton.addEventListener("click", function () {
            openEditPopup(recipe);
        });

        // Delete button to confirm delete
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button");
        deleteButton.addEventListener("click", function () {
            openDeletePopup(recipe.recipe_id); // Pass recipe ID to openDeletePopup
        });


        // Append buttons to the card container
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        cardContainer.appendChild(buttonContainer);

        // Append recipe card to the container
        container.appendChild(cardContainer);
    });
}
  
function openViewPopup(recipe) {
    const viewPopup = document.getElementById("viewPopup");
    const popupTitle = document.getElementById("popupTitle");
    const popupDetails = document.getElementById("popupDetails");

    // Populate popup with recipe details
    popupTitle.textContent = recipe.recipe_name;
    popupDetails.innerHTML = `
        <p><strong>Cooking Time:</strong> ${recipe.cooking_time} minutes</p>
        <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
            ${recipe.ingredients.split(', ').map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong></p>
        <p>${recipe.instructions}</p>
    `;

    // Display the view popup
    viewPopup.style.display = "flex";
}

// Function to close view popup
function closeViewPopup() {
    const viewPopup = document.getElementById("viewPopup");
    if (viewPopup) {
      viewPopup.style.display = "none";
    }
  }

  // Example of opening edit popup with direct DOM element manipulation
  function openEditPopup(recipe) {
    // Populate the edit popup form fields with recipe details
    console.log('Client recipe_id:', recipe.recipe_id);

    // Populate the edit popup form fields with recipe details
    document.getElementById("recipe-id").value = recipe.recipe_id;
    document.getElementById("edit-recipe-name").value = recipe.recipe_name;
    document.getElementById("edit-cooking-time").value = recipe.cooking_time;
    document.getElementById("edit-ingredients").value = recipe.ingredients;
    document.getElementById("edit-instructions").value = recipe.instructions;
    // Set the selected option in the cuisine dropdown
    const editCuisineSelect = document.getElementById("edit-cuisine");
    for (let i = 0; i < editCuisineSelect.options.length; i++) {
      if (editCuisineSelect.options[i].value === recipe.cuisine) {
        editCuisineSelect.selectedIndex = i;
        break;
      }
    }
  
    // Display the edit popup
    const editPopup = document.getElementById("editPopup");
    if (editPopup) {
      editPopup.style.display = "flex";
    }
}


  // Function to close edit popup
  function closeEditPopup() {
    const editPopup = document.getElementById("editPopup");
    if (editPopup) {
      editPopup.style.display = "none";
    }
  }

  // Example of opening add popup with direct DOM element manipulation
  function openAddPopup() {
    const addPopup = document.getElementById("addPopup");
    if (addPopup) {
      addPopup.style.display = "flex";
    }
  }
  
  // Function to close add popup
function closeAddPopup() {
  const addPopup = document.getElementById("addPopup");
  if (addPopup) {
    addPopup.style.display = "none";
  }
}
  
// Function to open delete popup
function openDeletePopup(recipeId) {
    const deletePopup = document.getElementById("deletePopup");
    const recipeIdField = document.getElementById("recipe_id");

    if (deletePopup && recipeIdField) {
        recipeIdField.value = recipeId; // Set recipe_id value
        deletePopup.style.display = "block";
    }
}

// Function to close delete popup
function closeDeletePopup() {
    const deletePopup = document.getElementById("deletePopup");
    if (deletePopup) {
        deletePopup.style.display = "none";
    }
}

  // Event listener for window click to close popups
  window.onclick = function(event) {
    const editPopup = document.getElementById("editPopup");
    const addPopup = document.getElementById("addPopup");
  
    if (event.target === editPopup) {
      editPopup.style.display = "none";
    }
  
    if (event.target === addPopup) {
      addPopup.style.display = "none";
    }
  };
  
  // Call getRecipes function on window load to fetch and display recipes
  window.onload = function() {
    closeAddPopup()
    closeDeletePopup();
    closeViewPopup();
    closeEditPopup();
    getRecipes(); // Fetch recipes from server on page load
  };
  
  