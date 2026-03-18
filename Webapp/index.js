const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

// MongoDB connection
// mongoose
//   .connect(
//     "mongodb+srv://kiran1104_db_user:VsxQ2SCnphgCEGVY@floridium.vkjfn7c.mongodb.net/floridium?retryWrites=true&w=majority&appName=floridium",
//   )
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "_KEY_",
    resave: false,
    saveUninitialized: false,
  }),
);

// Start server
app.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});