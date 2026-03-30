const testdata = { // temp database
    plant_1: {
        moisture: "High",
        SoilHealth: "Good",
        Sunlight: "Partial",
        waterLevel: "Empty"
    },
    plant_2: {
        moisture: "Low",
        SoilHealth: "Excellent",
        Sunlight: "Full",
        waterLevel: "Full"
    }
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

            output += `
                <section class="PlantContainer">
                    <img src="Assets/721a75ada244b9bd4b43b76c9a256412f598e1f7.jfif" alt="Plant Image">
                    <div class="PlantDetails">
                        <div class="PlantTitle">
                        <h2>PLANT ${index + 1}</h2>
                        <button><img src="Assets/history.png" alt=""></button>
                        </div>
                        <h3>ID: ${plant._id} </h3>
                        <p><strong>Sunlight:</strong> ${latestSun} units</p>
                        <p><strong>Moisture:</strong> ${latestMoisture}%</p>
                        <p><strong>Temperature:</strong> ${latestTemp}°C</p>
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