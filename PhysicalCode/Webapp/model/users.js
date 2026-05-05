const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = model("User", userSchema);

async function addUser(username, password) {
  console.log("addUser called with:", username, password);

  const found = await User.findOne({ username }).exec();
  if (found) {
    console.log("User already found");
    return false;
  }

  const newUser = await User.create({ username, password });
  console.log("Created user:", newUser);

  return true;
}

// Check login
async function checkUser(username, password) {
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) return null;

  if (foundUser.password !== password) return null;

  return foundUser;
}

module.exports = {
  addUser,
  checkUser,
};
