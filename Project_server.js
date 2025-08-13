const http = require('http');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql2');
const querystring = require('querystring');
const session = require('express-session');
const path = require('path');

//-----------------------------------------------------------------------------------------------------
// Setup MySQL connection
const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tiger',
});

// Connect to MySQL
con.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
  createDBAndTable(); // Ensure database and table exist
});

// Function to create database and table if they do not exist
function createDBAndTable() {
  const sqlDatabase = 'CREATE DATABASE IF NOT EXISTS cookbook_user_db';
  con.query(sqlDatabase, (err) => {
    if (err) throw err;
    console.log('Database cookbook_user_db created or already exists');

    // Use the database
    con.query('USE cookbook_user_db', (err) => {
      if (err) throw err;
      console.log('Using database cookbook_user_db');

      // Create User table if it does not exist
      const userTable = 'CREATE TABLE IF NOT EXISTS User ( user_id INT AUTO_INCREMENT PRIMARY KEY,'+
        'user_f_name VARCHAR(50), user_l_name VARCHAR(50), user_email VARCHAR(255),'+
        'acc_username VARCHAR(50) UNIQUE, acc_password VARCHAR(50) )';

      con.query(userTable, (err) => {
        if (err) throw err;
        console.log('User table created or already exists');
      });

      // Create Recipe table if it does not exist
      const recipeTable = `
      CREATE TABLE IF NOT EXISTS Recipe (
        recipe_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        recipe_name VARCHAR(255),
        cooking_time VARCHAR (4),
        cuisine VARCHAR(100),
        instructions TEXT,
        ingredients TEXT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
        )
      `;
      con.query(recipeTable, (err, result) => {
        if (err) {
            throw err;
        }
        console.log('Recipe table created or already exists');
    });

    });
  });
}

//-----------------------------------------------------------------------------------------------------
// Express session middleware setup
const sessionMiddleware = session({
  secret: 'your-secret-key', // Change this to a random string for security
  resave: false,
  saveUninitialized: true
});

//-----------------------------------------------------------------------------------------------------
// Function to create or update session
function createOrUpdateSession(req, userId) {
  if (req.session) {
    req.session.userId = userId;
    req.session.loggedIn = true;
    console.log('Session created!')
  }
}

// Function to get session data
function getSessionData(req) {
  if (req.session) {
    return {
      userId: req.session.userId,
      loggedIn: req.session.loggedIn
    };
  }
  return null;
}

// Function to delete session
function deleteSession(req) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        console.log('Session deleted successfully');
      }
    });
  }
}

//-----------------------------------------------------------------------------------------------------
// Function to fetch user profile data based on session
function fetchProfile(req, res) {
  const sessionData = getSessionData(req);

  if (!sessionData || !sessionData.userId) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('User session not found');
      return;
  }

  const userId = sessionData.userId;
  const query = 'SELECT * FROM User WHERE user_id = ?';

  con.query(query, [userId], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Database Error');
      } else {
          console.log('User details fetched from user table successfully');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result)); // Send JSON response with fetched data
      }
  });
}


//-----------------------------------------------------------------------------------------------------
// Function to handle signup POST requests
function handleSignup(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const postData = querystring.parse(body);
    const { user_f_name, user_l_name, user_email, user_birthdate, acc_username, acc_password } = postData;

    const query = 'INSERT INTO User (user_f_name, user_l_name, user_email, acc_username, acc_password) VALUES (?, ?, ?, ?, ?)';
    con.query(query, [user_f_name, user_l_name, user_email, acc_username, acc_password], (err, result) => {
      if (err) {
        console.error('Username already exists, try another');
        res.writeHead(302, { 'Location': '/Signup.html' });
        res.end();
      } else {
        console.log('Account created successfully');
        // Create or update session after successful signup
        console.log(result);
        createOrUpdateSession(req, result.insertId); // Assuming result.insertId is the user_id
        res.writeHead(302, { Location: '/user-dashboard.html' });
        res.end();
      }
    });
  });

  req.on('error', (err) => {
    console.error('Error receiving data:', err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error receiving data');
  });
}

//-----------------------------------------------------------------------------------------------------
// Function to handle login POST requests
function handleLogin(req, res) {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { acc_username, acc_password } = querystring.parse(body);

    const query = 'SELECT * FROM User WHERE acc_username = ? AND acc_password = ?';
    con.query(query, [acc_username, acc_password], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Database Error');
      } else {
        if (result.length > 0) {
          console.log('Login successful');
          // Create or update session after successful login
          createOrUpdateSession(req, result[0].user_id); // Assuming user_id is the primary key
          res.writeHead(302, { Location: '/user-dashboard.html' });
          res.end();
        } else {
          console.log('Login failed: Invalid username or password');
          res.writeHead(302, { Location: '/login.html' });
          res.end();
        }
      }
    });
  });

  req.on('error', (err) => {
    console.error('Error receiving data:', err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error receiving data');
  });
}

//-----------------------------------------------------------------------------------------------------
//Log out from admin pages
function handleLogOut(req, res){
  const sessionData = getSessionData(req);

  if (!sessionData || !sessionData.loggedIn) {
    console.error('User not logged in');
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('User not logged in');
    return;
  }
  deleteSession(req);
  console.log('User Logged out successfully!');
  res.writeHead(302, { Location: '/index.html' });
  res.end();
}
//-----------------------------------------------------------------------------------------------------
// Function to fetch recipes from the database for user homepage
function fetchHomeRecipes(req, res) {
  const query = 'SELECT * FROM Recipe ORDER BY recipe_id DESC LIMIT 3';


  con.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database Error');
    } else {
      console.log('Recipes fetched from recipe table successfully');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result)); // Send JSON response with fetched data
    }
  });
}

//-----------------------------------------------------------------------------------------------------
// To fetch recipes from database
// Function to fetch recipes from the database
function fetchRecipes(req, res) {
  const query = 'SELECT u.user_f_name, u.user_l_name, r.* FROM Recipe r, User u WHERE u.user_id=r.user_id';


  con.query(query, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database Error');
    } else {
      console.log('Recipes fetched from recipe table successfully');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result)); // Send JSON response with fetched data
    }
  });
}

//-----------------------------------------------------------------------------------------------------
// To fetch recipes from database
// Function to fetch recipes from the database
function fetchMyRecipes(req, res) {
  console.log('Fetching user recipes')
  const userId = getSessionData(req, res);
  const query = 'SELECT * FROM Recipe WHERE user_id = ?';

  con.query(query, [userId.userId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Database Error');
    } else {
      console.log('User recipes fetched successfully');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result)); // Send JSON response with fetched data
    }
  });
}

//-----------------------------------------------------------------------------------------------------
//To add a recipe
function addRecipe(req, res) {
  let body = '';

  // Collect data from request body
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  // Process collected data
  req.on('end', () => {
    const formData = querystring.parse(body);

    // Extract form data
    const {
      'recipe-name': recipe_name,
      'cooking-time': cooking_time,
      cuisine,
      ingredients,
      instructions
    } = formData;

    const sessionData = getSessionData(req);

    // Check if user is logged in
    if (!sessionData || !sessionData.loggedIn) {
      console.error('User not logged in');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('User not logged in');
      return;
    }

    // Insert into database
    const query = 'INSERT INTO Recipe (user_id, recipe_name, cooking_time, cuisine, instructions, ingredients) VALUES (?, ?, ?, ?, ?, ?)';
    const userId = sessionData.userId;

    con.query(query, [userId, recipe_name, cooking_time, cuisine, instructions, ingredients], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Database Error');
      } else {
        console.log('Recipe added successfully');
        res.writeHead(302, { Location: '/myRecipes.html' });
        res.end();
      }
    });
  });

  // Error handling for request
  req.on('error', (err) => {
    console.error('Error receiving data:', err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error receiving data');
  });
}

//-----------------------------------------------------------------------------------------------------
// To edit an existing recipe
function editRecipe(req, res) {
  let body = '';

  // Collect data from request body
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  // Process collected data
  req.on('end', () => {
    console.log('Received body:', body);

    const formData = querystring.parse(body);
    console.log('Parsed formData:', formData);
    // Extract form data
    const recipe_id = formData.recipe_id;
    const recipe_name = formData.recipe_name;
    const cooking_time = formData.cooking_time;
    const cuisine = formData.cuisine;
    const ingredients = formData.ingredients;
    const instructions = formData.instructions;
    
    const sessionData = getSessionData(req);

    // Check if user is logged in
    if (!sessionData || !sessionData.loggedIn) {
      console.error('User not logged in');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('User not logged in');
      return;
    }

    // Insert into database
    const query = 'UPDATE RECIPE SET recipe_name = ?, cooking_time = ?, cuisine = ?, ingredients = ?, instructions = ? WHERE user_id = ? AND recipe_id = ?';
    const userId = sessionData.userId;
    console.log('SQL Query:', query);
    con.query(query, [recipe_name, cooking_time, cuisine, ingredients, instructions, userId, recipe_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Database Error');
      } else {
        if (result.affectedRows > 0) {
          console.log('Recipe updated successfully');
          res.writeHead(302, { Location: '/myRecipes.html' });
          res.end();
        } else {
          console.error('Recipe not found or unauthorized');
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Recipe not found or unauthorized');
        }
      }
    });
  });

  // Error handling for request
  req.on('error', (err) => {
    console.error('Error receiving data:', err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error receiving data');
  });
}

//-----------------------------------------------------------------------------------------------------
// To delete a recipe
function deleteRecipe(req, res) {
  let body = '';

  // Collect data from request body
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  // Process collected data
  req.on('end', () => {
    const formData = querystring.parse(body);

    // Extract form data
    const recipe_id = parseInt(formData.recipe_id); // Parse to integer

    // Get session data
    const sessionData = getSessionData(req);

    // Check if user is logged in
    if (!sessionData || !sessionData.loggedIn) {
      console.error('User not logged in');
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('User not logged in');
      return;
    }

    // Check if recipe_id is a valid positive integer
    if (!Number.isInteger(recipe_id) || recipe_id <= 0) {
      console.error('Invalid recipe_id');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid recipe_id');
      return;
    }

    // Delete from database
    const query = 'DELETE FROM Recipe WHERE recipe_id = ? AND user_id = ?';
    const userId = sessionData.userId;

    con.query(query, [recipe_id, userId], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Database Error');
      } else {
        if (result.affectedRows > 0) {
          console.log('Recipe deleted successfully');
          res.writeHead(302, { Location: '/myRecipes.html' });
          res.end();
        } else {
          console.error('Recipe not found or unauthorized');
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Recipe not found or unauthorized');
        }
      }
    });
  });

  // Error handling for request
  req.on('error', (err) => {
    console.error('Error receiving data:', err);
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Error receiving data');
  });
}


//-----------------------------------------------------------------------------------------------------
// HTTP server setup
const server = http.createServer((req, res) => {
  sessionMiddleware(req, res, () => {
    let filePath = '.' + req.url;
    const parsedUrl = url.parse(req.url);
    const UrlFragments = parsedUrl.pathname.split('.'); // Breaks down the pathname into fragments
    const extension = UrlFragments.pop(); // Used to extract last bit from the fragment which contains the extension
    let contentType = 'text/html';

    switch (extension) { // Used to determine content type of the file selected
      case 'html':
        contentType = 'text/html';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      case 'js':
        contentType = 'text/javascript';
        break;
      case 'jpg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
    }

    if (filePath === './') {
      res.writeHead(302, { Location: '/index.html' });
      res.end();
      return;
    } else if (filePath === './index') {
      filePath = './index.html';
      fetchHomeRecipes(req, res);
      return;
    } else if (filePath === './Signup' && req.method === 'POST') {
      handleSignup(req, res);
      return;
    } else if (filePath === './user-dashboard') {
      filePath = './user-dashboard.html';
      fetchRecipes(req, res); // Fetch recipes for user-dashboard.html
      return;
    } else if (filePath === './myRecipes') {
      filePath = './myRecipes.html';
      fetchMyRecipes(req, res); // Fetch recipes for user-dashboard.html
      return;
    } else if (filePath === './Login' && req.method === 'POST') {
      handleLogin(req, res);
      return;
    } else if (filePath === '/logOut') {
      deleteSession(req);
      console.log('User has been logged out.........');
      res.writeHead(302, { Location: './' });
    } else if (filePath === '/profile') {
      profile(req, res);
      console.log('Displaying user profile');
      res.writeHead(302, { Location: './' });
    } else if (filePath === './addRecipe' && req.method === 'POST'){
      filePath = './myRecipes.html';
      addRecipe(req, res); 
      return; // Don't forget to return after calling addRecipe
    } else if(filePath === './logOut'){
      filePath = './index.html';
      handleLogOut(req,res);
      return;
    } else if (filePath === './editRecipe' && req.method === 'POST'){
      filePath = './myRecipes.html';
      editRecipe(req, res); 
      return;
    } else if (filePath === './deleteRecipe' && req.method === 'POST'){
      filePath = './myRecipes.html';
      deleteRecipe(req, res); 
      return;
    } else if (filePath === './profile'){
      filePath = './profile.html';
      fetchProfile(req, res);
      return;
    } else if (filePath === './user-recipes') {
      filePath = './user-recipes.html';
      fetchRecipes(req, res); // Fetch recipes for user-dashboard.html
      return;
    }
    
          
    fs.readFile(filePath, (err, content) => { // Displays file using appropriate content type
      if (err) {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
}).listen(8080);
