const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const users = require("./model/users");

const app = express();

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://kiran1104_db_user:VsxQ2SCnphgCEGVY@floridium.vkjfn7c.mongodb.net/floridium?retryWrites=true&w=majority&appName=floridium",
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false,
  }),
);

// Routes
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register", async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { username, password } = req.body;
    console.log("USERNAME:", username);
    console.log("PASSWORD:", password);

    const success = await users.addUser(username, password);
    console.log("ADD USER RESULT:", success);

    if (!success) {
      return res.send("User already exists");
    }

    res.send("User created!");
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).send("Error creating user");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await users.checkUser(username, password);

    if (user) {
      req.session.username = user.username;
      req.session.userId = user._id;

      return res.json({
        success: true,
        userId: user._id,
        username: user.username,
      });
    }

    return res.sendFile(path.join(__dirname, "views", "notloggedin.html"));
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).send("Error logging in");
  }
});

// Optional homepage test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});
