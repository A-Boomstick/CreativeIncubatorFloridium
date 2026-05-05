const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

const loadPlantHistory = async () => {
    try {
        const response = await fetch(`/api/plants/${plantId}`);
        const plant = await response.json();

        console.log("Plant data:", plant);

        // Example: display history
        // document.getElementById("history").innerHTML = `
        //   <h2>Plant ID: ${plant._id}</h2>
        //   <p>Moisture history: ${plant.Moisture.join(", ")}</p>
        //   <p>Sunlight history: ${plant.Sunlight.join(", ")}</p>
        //   <p>Temperature history: ${plant.Temprature.join(", ")}</p>
        // `;

        moistureChart = null;
        sunlightChart = null;
        temperatureChart = null;

        const Mctx = document.getElementById("MoistureChart").getContext("2d");
        const Sctx = document.getElementById("SunlightChart").getContext("2d");
        const Tctx = document.getElementById("TemperatureChart").getContext("2d");

        if (moistureChart) {
            moistureChart.destroy();
        }

        if (sunlightChart) {
            sunlightChart.destroy();
        }

        if (temperatureChart) {
            temperatureChart.destroy();
        }

        // temp stats
        const idealMoistureUpper = 70;
        const idealMoistureLower = 40;
        const idealTemperatureUpper = 24;
        const idealTemperatureLower = 15;
        const idealSunlightUpper = 60;
        const idealSunlightLower = 50;

        sunlightChart = new Chart(Sctx, {
            type: 'line',
            data: {
                labels: plant.Sunlight.map((_, i) => `Reading ${i + 1}`),
                datasets: [
                    {
                        label: "Sunlight",
                        data: plant.Sunlight,
                        borderColor: "#e9b31e",
                        backgroundColor: "#e9b31e",
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: "Ideal Sunlight Upper bounds",
                        data: plant.Sunlight.map(() => idealSunlightUpper),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    },
                    {
                        label: "Ideal Sunlight Lower bounds",
                        data: plant.Sunlight.map(() => idealSunlightLower),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })

        moistureChart = new Chart(Mctx, {
            type: 'line',
            data: {
                labels: plant.Moisture.map((_, i) => `Reading ${i + 1}`), // make these timestamps
                datasets: [
                    {
                        label: "Moisture",
                        data: plant.Moisture,
                        borderColor: "blue",
                        backgroundColor: "blue",
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: "Ideal Moisture Upper Bounds",
                        data: plant.Moisture.map(() => idealMoistureUpper),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    },
                    {
                        label: "Ideal Moisture Lower Bounds",
                        data: plant.Moisture.map(() => idealMoistureLower),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        temperatureChart = new Chart(Tctx, {
            type: 'line',
            data: {
                labels: plant.Temprature.map((_, i) => `Reading ${i + 1}`), // make these timestamps
                datasets: [
                    {
                        label: "Temperature",
                        data: plant.Temprature,
                        borderColor: "#df1616",
                        backgroundColor: "#df1616",
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: "Ideal temperature Upper bounds",
                        data: plant.Temprature.map(() => idealTemperatureUpper),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    },
                    {
                        label: "Ideal temperature Lower bounds",
                        data: plant.Temprature.map(() => idealTemperatureLower),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });


    } catch (err) {
        console.error("Error loading history:", err);
    }
};

loadPlantHistory();