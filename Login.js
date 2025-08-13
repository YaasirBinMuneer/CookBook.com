document.addEventListener("DOMContentLoaded", function () {
    getRecipes();
  });
  
  // Function to fetch recipes from the server
  function getRecipes() {
    fetch('/Login')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(message => {
        displayMessage(message); // Call the displayRecipes function with fetched data
      })
      .catch(error => console.error("Error fetching recipes:", error));
  }

  function displayMessage(message){
    document.getElementById('error-message')= message.message;
  }
