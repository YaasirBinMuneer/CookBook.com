document.addEventListener("DOMContentLoaded", function () {
    getProfile();
});

// Function to fetch profiles from the server
function getProfile() {
    fetch('/profile')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(details => {
            displayProfile(details); // Call the displayProfile function with fetched data
        })
        .catch(error => console.error("Error fetching profiles:", error));
}

function displayProfile(details) {
    const container = document.getElementById("profile-details"); // Corrected ID here

    container.innerHTML = ''; // Clear previous content

    details.forEach(profile => {
        // Create profile card container (li element)
        const cardContainer = document.createElement("li");
        cardContainer.classList.add("profile-card");

        // First name as text
        const firstName = document.createElement("p");
        firstName.textContent = `First Name: ${profile.user_f_name}`;
        firstName.classList.add("user-full-name"); // Use the existing class for styling
        cardContainer.appendChild(firstName);

        // Last name as text
        const lastName = document.createElement("p");
        lastName.textContent = `Last Name: ${profile.user_l_name}`;
        lastName.classList.add("user-full-name"); // Use the existing class for styling
        cardContainer.appendChild(lastName);

        // Email as text
        const emailText = document.createElement("p");
        emailText.textContent = `Email: ${profile.user_email}`;
        emailText.classList.add("user-email"); // Use the existing class for styling
        cardContainer.appendChild(emailText);

        //Username as text
        const usernameText = document.createElement("p");
        usernameText.textContent = `Username: ${profile.acc_username}`;
        usernameText.classList.add("user-email"); // Use the existing class for styling
        cardContainer.appendChild(usernameText);

        //Password as text
        const passwordText = document.createElement("p");
        passwordText.textContent = `Password: ${profile.acc_password}`;
        passwordText.classList.add("user-email"); // Use the existing class for styling
        cardContainer.appendChild(passwordText);

        // Append profile card container to main container
        container.appendChild(cardContainer);
    });
}
