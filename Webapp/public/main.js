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

const renderPlants = () => { // function to make the plant containers and push it to the html page
    let output = ""; // HTML syntax goes in here

    Object.entries(testdata).forEach(([key, plant]) => { // loops through the object
        output += `
            <section class="PlantContainer">
                <img src="Assets/721a75ada244b9bd4b43b76c9a256412f598e1f7.jfif" alt="Plant Image">
                <div class="PlantDetails">
                    <h2>${key.toUpperCase()}</h2>
                    <p><strong>Moisture:</strong> ${plant.moisture}</p>
                    <p><strong>Soil Health:</strong> ${plant.SoilHealth}</p>
                    <p><strong>Sunlight:</strong> ${plant.Sunlight}</p>
                    <p><strong>Water Level:</strong> ${plant.waterLevel}</p>
                </div>
            </section>
        `;
    });

    document.getElementById("plant-list").innerHTML = output; // Pushes the output to the front end
};

renderPlants();