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

    if (!user) {
      return res.send("Invalid username or password");
    }

    req.session.username = user.username;
    req.session.userId = user._id;

    return res.redirect("/homepage");
  } catch (err) {
    console.log("Login error:", err);
    res.status(500).send("Error logging in");
  }
});

app.get("/homepage", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  res.sendFile(path.join(__dirname, "views", "homepage.html"));
});

app.get("/HomepageLink", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "homepage.html"));
});

app.get("/AboutUs", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "AboutUs.html"));
});

// creating a connection to the test user
const testUser = mongoose.createConnection("mongodb+srv://kiran1104_db_user:VsxQ2SCnphgCEGVY@floridium.vkjfn7c.mongodb.net/userJeff?retryWrites=true&w=majority");

// storing the plant data
const plantData = new mongoose.Schema({
    Sunlight: [Number],
    Moisture: [Number],
    Temprature: [Number],
    DateStart: String 
}, { 
    collection: 'plantPotOne',
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

const PlantModel = testUser.model('Plant', plantData);

app.get("/plantsOwned", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "plantsOwned.html"));
});

app.get("/api/plants", async (req, res) => {
    try {
        const plants = await PlantModel.find({});
        res.json(plants); 
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch plants" });
    }
});

// route to plant history
app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "history.html"));
});

app.get("/api/plants/:id", async (req, res) => {
  try {
    const plant = await PlantModel.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json(plant);
  } catch (err) {
    console.error("Fetch plant error:", err);
    res.status(500).json({ error: "Server error" });
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
