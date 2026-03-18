const testdata = {
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

const renderPlants = () => {
    const mainContainer = document.getElementById("plant-list");
    let output = "";

    Object.entries(testdata).forEach(([key, plant]) => {
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

    document.getElementById("plant-list").innerHTML = output;
};

// Start the process
renderPlants();