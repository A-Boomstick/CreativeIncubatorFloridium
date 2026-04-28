// temp stats
const idealMoistureUpper = 70;
const idealMoistureLower = 40;
const idealTemperatureUpper = 24;
const idealTemperatureLower = 15
const idealSunlightUpper = 60;
const idealSunlightLower = 50;

const inRange = (value, lower, upper) => value >= lower && value <= upper;

const getStatusIcon = (value, lower, upper) => {
    const ok = inRange(value, lower, upper);

    return {
        src: "Assets/like.png",
        className: ok ? "thumb-up" : "thumb-down",
        alt: ok ? "Within ideal range" : "Outside ideal range"
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

            const moistureStatus = getStatusIcon(latestMoisture, idealMoistureLower, idealMoistureUpper);
            const sunlightStatus = getStatusIcon(latestSun, idealSunlightLower, idealSunlightUpper);
            const tempStatus = getStatusIcon(latestTemp, idealTemperatureLower, idealTemperatureUpper);

            output += `
                <section class="PlantContainer">
                    <img src="Assets/721a75ada244b9bd4b43b76c9a256412f598e1f7.jfif" alt="Plant Image">
                    <div class="PlantDetails">
                        <div class="PlantTitle">
                            <h2>PLANT ${index + 1}</h2>
                            <button id="${plant._id}">
                                <img src="Assets/history.png" alt="">
                            </button>
                        </div>

                        <h3>ID: ${plant._id}</h3>

                        <p>
                            <strong>Sunlight:</strong> ${latestSun} units
                            <img src="${sunlightStatus.src}" alt="${sunlightStatus.alt}" class="status-icon ${sunlightStatus.className}">
                        </p>

                        <p>
                            <strong>Moisture:</strong> ${latestMoisture}%
                            <img src="${moistureStatus.src}" alt="${moistureStatus.alt}" class="status-icon ${moistureStatus.className}">
                        </p>

                        <p>
                            <strong>Temperature:</strong> ${latestTemp}°C
                            <img src="${tempStatus.src}" alt="${tempStatus.alt}" class="status-icon ${tempStatus.className}">
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

addPotBTN.addEventListener("click", async () => {
    const potID = potIDinput.value.trim();

    try {
        const response = await fetch("/api/addPot", {
            method: "POST",
            headers: {
                "content-Type": "application/json"
            },
            body: JSON.stringify({potID})
        })

        const data = await response.json();

        potIDinput.value = "";

        renderPlants();

    } catch (err) {
        console.error("Error adding pot to user:", err);
    }
})