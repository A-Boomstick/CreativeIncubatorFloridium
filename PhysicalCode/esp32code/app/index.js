const express = require("express");
const path = require("path");
const app = express();

require('dotenv').config();

app.use(express.json());


const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to the DB");
  })
  .catch(err => {
    console.log("Can't find the database!", err)
    process.exit();
  })

const plantDataSchema = new mongoose.Schema({
  box_id: String,
  date_start: String,
  temprature_reading: String,
  moisture_reading: String,
  sunlight_reading: String,
  reading_date: String,
  reading_time: { type: Date, default: Date.now }
})

const data = mongoose.model("data", plantDataSchema);

app.post("/data", async (req, res) => {
  try{
    console.log(req.body);
    const newData = new DataTransfer(req.body);
    await newData.save();
    res.send("Saved To DB");
  }
  catch (err){
    console.error(err);
    res.status(500).send("Error saving data");
  }


  
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
