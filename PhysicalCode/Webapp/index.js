require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const users = require("./model/users");

const app = express();

// change this manually when testing without a real login
const TEMP_TEST_USER = "ted";

// keep dotenv support from the other version
const mongoUri =
  process.env.MONGO_URI ||
  "mongodb+srv://kiran1104_db_user:VsxQ2SCnphgCEGVY@floridium.vkjfn7c.mongodb.net/floridium?retryWrites=true&w=majority&appName=floridium";

// MongoDB connection
mongoose
  .connect(mongoUri)
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

// --------------------
// Schemas / Models
// --------------------

const userPotTableSchema = new mongoose.Schema(
  {
    user_id: String,
    pot_ids: [String],
  },
  { collection: "user_pot_table" },
);

const dataSchema = new mongoose.Schema(
  {
    box_id: String,
    moisture_reading: mongoose.Schema.Types.Mixed,
    temprature_reading: mongoose.Schema.Types.Mixed,
    sunlight_reading: mongoose.Schema.Types.Mixed,
    reading_time: Date,
  },
  { collection: "datas" },
);

const UserPotTable =
  mongoose.models.UserPotTable ||
  mongoose.model("UserPotTable", userPotTableSchema);

const PlantReading =
  mongoose.models.PlantReading ||
  mongoose.model("PlantReading", dataSchema);

// --------------------
// Helper functions
// --------------------

function groupPlantsFromReadings(readings) {
  const groupedPlants = {};

  readings.forEach((reading) => {
    const boxId = reading.box_id;

    if (!groupedPlants[boxId]) {
      groupedPlants[boxId] = {
        _id: boxId,
        box_id: boxId,
        Sunlight: [],
        Moisture: [],
        Temprature: [],
        DateStart: reading.reading_time,
      };
    }

    const moisture = Number(reading.moisture_reading);
    const temp = Number(reading.temprature_reading);
    const sunlight = Number(reading.sunlight_reading);

    if (!Number.isNaN(moisture)) {
      groupedPlants[boxId].Moisture.push(moisture);
    }

    if (!Number.isNaN(temp)) {
      groupedPlants[boxId].Temprature.push(temp);
    }

    if (!Number.isNaN(sunlight)) {
      groupedPlants[boxId].Sunlight.push(sunlight);
    }
  });

  return Object.values(groupedPlants);
}

function buildSinglePlantFromReadings(readings, boxId) {
  if (!readings.length) return null;

  const plant = {
    _id: boxId,
    box_id: boxId,
    Sunlight: [],
    Moisture: [],
    Temprature: [],
    DateStart: readings[0].reading_time,
  };

  readings.forEach((reading) => {
    const moisture = Number(reading.moisture_reading);
    const temp = Number(reading.temprature_reading);
    const sunlight = Number(reading.sunlight_reading);

    if (!Number.isNaN(moisture)) {
      plant.Moisture.push(moisture);
    }

    if (!Number.isNaN(temp)) {
      plant.Temprature.push(temp);
    }

    if (!Number.isNaN(sunlight)) {
      plant.Sunlight.push(sunlight);
    }
  });

  return plant;
}

// --------------------
// Routes
// --------------------

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

// kept because the other code had lowercase /aboutus too
app.get("/aboutus", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "AboutUs.html"));
});

app.get("/plantsOwned", (req, res) => {
  // preserve real login if it exists, otherwise use your temporary test user
  if (!req.session.username) {
    req.session.username = TEMP_TEST_USER;
  }

  res.sendFile(path.join(__dirname, "views", "plantsOwned.html"));
});

app.get("/api/plants", async (req, res) => {
  try {
    const currentUsername = req.session.username || TEMP_TEST_USER;

    if (!currentUsername) {
      return res.status(401).json({ error: "No user selected" });
    }

    const userPotDoc = await UserPotTable.findOne({
      user_id: currentUsername,
    }).lean();

    if (!userPotDoc || !userPotDoc.pot_ids || userPotDoc.pot_ids.length === 0) {
      return res.json([]);
    }

    const readings = await PlantReading.find({
      box_id: { $in: userPotDoc.pot_ids },
    })
      .sort({ box_id: 1, reading_time: 1 })
      .lean();

    const plants = groupPlantsFromReadings(readings);

    res.json(plants);
  } catch (err) {
    console.error("Fetch plants error:", err);
    res.status(500).json({ error: "Failed to fetch plants" });
  }
});

// route to plant history
app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "history.html"));
});

app.get("/api/plants/:id", async (req, res) => {
  try {
    const currentUsername = req.session.username || TEMP_TEST_USER;

    if (!currentUsername) {
      return res.status(401).json({ error: "No user selected" });
    }

    const userPotDoc = await UserPotTable.findOne({
      user_id: currentUsername,
    }).lean();

    if (!userPotDoc || !userPotDoc.pot_ids.includes(req.params.id)) {
      return res.status(403).json({ error: "Plant not owned by this user" });
    }

    const readings = await PlantReading.find({
      box_id: req.params.id,
    })
      .sort({ reading_time: 1 })
      .lean();

    const plant = buildSinglePlantFromReadings(readings, req.params.id);

    if (!plant) {
      return res.status(404).json({ error: "Plant not found" });
    }

    res.json(plant);
  } catch (err) {
    console.error("Fetch plant error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/addPot", async (req, res) => {
  try {
    const currentUsername = req.session.username || TEMP_TEST_USER;
    const { potID } = req.body;

    const updatedDoc = await UserPotTable.findOneAndUpdate(
      { user_id: currentUsername },
      { $addToSet: { pot_ids: potID } },
      { new: true, upsert: true }
    ).lean();

    res.json({
      message: "Pot added successfully",
      user: currentUsername,
      pot_ids: updatedDoc.pot_ids,
    });

  } catch (err) {
    console.error("failed to add pot:", err);
    res.status(500).json({ error: "failed to add pot" })
  }
})

// Optional homepage test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});