// temp stats
const idealMoistureUpper = 70;
const idealMoistureLower = 45;
const idealTemperatureUpper = 28;
const idealTemperatureLower = 18;
const idealSunlightUpper = 1700;
const idealSunlightLower = 500;
const upperIdealHum = 60;
const lowerIdealHum = 50;

const getStatusIcon = (value, lower, upper, label, unit) => {

    if (value >= lower && value <= upper) {
        return {
            src: "Assets/like.png",
            alt: `${label} is within ideal range`,
            tooltip: `${label} is within the ideal range.`,
            advice: "no action needed",
            severity: "good"
        };
    }

    let difference;
    let change;
    let severity;
    let advice;

    if (value < lower) {
        difference = lower - value;
        change = "increase";
    } else {
        difference = value - upper;
        change = "decrease";
    }

    const differencePercentage = (difference / (upper - lower)) * 100;

    if (differencePercentage <= 20) {
        severity = "minor";
        advice = `Slightly ${change} ${label.toLowerCase()} by about ${difference.toFixed(1)}${unit}.`;
    } else if (differencePercentage <= 40) {
        severity = "major";
        advice = `${label} needs adjusting. Try to ${change} it by about ${difference.toFixed(1)}${unit}.`;
    } else {
        severity = "extreme";
        advice = `${label} is far outside the ideal range. ${change === "increase" ? "Increase" : "Decrease"} it immediately by about ${difference.toFixed(1)}${unit}.`;
    }

    return {
        src: "Assets/warning.png",
        alt: `${label} isn't within ideal range`,
        tooltip: `${label} isn't within the ideal range.`,
        advice,
        severity
    };
};

const renderPlants = async () => {
    try {
        // fetch the data from mongo
        const response = await fetch('/api/plants');
        const dbData = await response.json();

        let output = "";

        // loop through the array returned by mongo
        dbData.forEach((plant, index) => {
            const latestMoisture = plant.Moisture[plant.Moisture.length - 1]; // only got the latest for now, could get the average of the last few asw
            const latestSun = plant.Sunlight[plant.Sunlight.length - 1];
            const latestTemp = plant.Temprature[plant.Temprature.length - 1];
            const latestHum = plant.Humidity[plant.Humidity.length - 1];

            const moistureStatus = getStatusIcon(latestMoisture, idealMoistureLower, idealMoistureUpper, "Moisture", "%");
            const sunlightStatus = getStatusIcon(latestSun, idealSunlightLower, idealSunlightUpper, "Sunlight", "units");
            const tempStatus = getStatusIcon(latestTemp, idealTemperatureLower, idealTemperatureUpper, "Temperature", "°C");
            const humStatus = getStatusIcon(latestHum, lowerIdealHum, upperIdealHum, "Humidity", "%");

            output += `
                <section class="PlantContainer">
                    <div class="DynamicPlant">
                        <img src="Assets/plantPot.png" alt="Plant Image" class="pot">

                        <img src="${sunlightStatus.src}" alt="${sunlightStatus.alt}" class="SunstatIMG" title="${sunlightStatus.tooltip}">
                        <img src="${moistureStatus.src}" alt="${moistureStatus.alt}" class="MoiststatIMG" title="${moistureStatus.tooltip}">
                        <img src="${tempStatus.src}" alt="${tempStatus.alt}" class="TempstatIMG" title="${tempStatus.tooltip}">
                        <img src="${humStatus.src}" alt="${humStatus.alt}" class="HumstatIMG" title="${humStatus.tooltip}">
                    </div>
                    <div class="PlantDetails">
                        <div class="PlantTitle">
                            <h2>${plant.plant_name || `PLANT ${index + 1}`}</h2>
                            <button id="${plant._id}">
                                <img src="Assets/history.png" alt="">
                            </button>
                        </div>

                        <h3>ID: ${plant._id}</h3>

                        <p class="stats" title="${sunlightStatus.tooltip}">
                            <img src="Assets/sunlight.png" alt="" class="identifiers">
                            <strong>Sunlight:</strong> ${latestSun} units
                            <img src="${sunlightStatus.src}" alt="${sunlightStatus.alt}" class="status-icon">
                            <span class="statAdvice ${sunlightStatus.severity}">${sunlightStatus.advice}</span>
                        </p>

                        <p class="stats" title="${moistureStatus.tooltip}">
                            <img src="Assets/moisture.png" alt="" class="identifiers">
                            <strong>Moisture:</strong> ${latestMoisture}%
                            <img src="${moistureStatus.src}" alt="${moistureStatus.alt}" class="status-icon">
                            <span class="statAdvice ${moistureStatus.severity}">${moistureStatus.advice}</span>
                        </p>

                        <p class="stats" title="${tempStatus.tooltip}">
                            <img src="Assets/temperature.png" alt="" class="identifiers">
                            <strong>Temperature:</strong> ${latestTemp}°C
                            <img src="${tempStatus.src}" alt="${tempStatus.alt}" class="status-icon">
                            <span class="statAdvice ${tempStatus.severity}">${tempStatus.advice}</span>
                        </p>

                        <p class="stats" title="${humStatus.tooltip}">
                            <img src="Assets/humidity.png" alt="" class="identifiers">
                            <strong>Humidity:</strong> ${latestHum}%
                            <img src="${humStatus.src}" alt="${humStatus.alt}" class="status-icon">
                            <span class="statAdvice ${humStatus.severity}">${humStatus.advice}</span>
                        </p>

                        <p><strong>Started:</strong> ${plant.DateStart}</p>
                    </div>
                </section>
            `;
        });

        document.getElementById("plant-list").innerHTML = output;

    } catch (err) {
        console.error("Error rendering plants:", err);
        document.getElementById("plant-list").innerHTML = "<p>Error loading plant data.</p>";
    }
};

renderPlants();

const PlantList = document.getElementById("plant-list");

PlantList.addEventListener("click", (event) => {
    const HistoryBTN = event.target.closest('button');

    if (HistoryBTN) {
        const PlantID = HistoryBTN.id
        console.log(PlantID)
        window.location.href = `/history?id=${PlantID}`;
    }
})


const addPotBTN = document.getElementById("addPotBTN");
const potIDinput = document.getElementById("potIDinput");
const potNameinput = document.getElementById("potNameinput");

addPotBTN.addEventListener("click", async () => {
    const potID = potIDinput.value.trim();
    const potName = potNameinput.value.trim();

    try {
        const response = await fetch("/api/addPot", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({ potID, potName })
        })

        const data = await response.json();

        potIDinput.value = "";
        potNameinput.value = "";

        renderPlants();

    } catch (err) {
        console.error("Error adding pot to user:", err);
    }
})

// code got from W3S - https://www.w3schools.com/howto/howto_js_countdown.asp
const Timer = document.getElementById("timer");

// Set the date we're counting down to
var countDownDate = new Date("July 19, 2026 15:37:25").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("timer").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("timer").innerHTML = "EXPIRED";
  }
}, 1000);