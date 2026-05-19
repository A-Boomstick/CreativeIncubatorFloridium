const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

const loadPlantHistory = async () => {
    try {
        const response = await fetch(`/api/plants/${plantId}`);
        const plant = await response.json();

        console.log("Plant data:", plant);

        moistureChart = null;
        sunlightChart = null;
        temperatureChart = null;
        humidityChart = null;


        const Mctx = document.getElementById("MoistureChart").getContext("2d");
        const Sctx = document.getElementById("SunlightChart").getContext("2d");
        const Tctx = document.getElementById("TemperatureChart").getContext("2d");
        const Hctx = document.getElementById("HumidityChart").getContext("2d");

        if (moistureChart) {
            moistureChart.destroy();
        }

        if (sunlightChart) {
            sunlightChart.destroy();
        }

        if (temperatureChart) {
            temperatureChart.destroy();
        }

        if (humidityChart) {
            humidityChart.destroy();
        }

        // temp stats
        const idealMoistureUpper = 70;
        const idealMoistureLower = 45;
        const idealTemperatureUpper = 28;
        const idealTemperatureLower = 18;
        const idealSunlightUpper = 1700;
        const idealSunlightLower = 500;
        const upperIdealHum = 60;
        const lowerIdealHum = 50;

        sunlightChart = new Chart(Sctx, {
            type: 'line',
            data: {
                labels: plant.ReadingTimes,
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
                labels: plant.ReadingTimes, // make these timestamps
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
                labels: plant.ReadingTimes,
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

        humidityChart = new Chart(Hctx, {
            type: 'line',
            data: {
                labels: plant.ReadingTimes,
                datasets: [
                    {
                        label: "Humidity",
                        data: plant.Humidity,
                        borderColor: "#23dcf5",
                        backgroundColor: "#23dcf5",
                        borderWidth: 2,
                        tension: 0.3
                    },
                    {
                        label: "Ideal Humidity Upper bounds",
                        data: plant.Humidity.map(() => upperIdealHum),
                        borderColor: "#1b9e26",
                        backgroundColor: "#1b9e26",
                        borderDash: [5, 5],
                        borderWidth: 2,
                        tension: 0
                    },
                    {
                        label: "Ideal Humidity Lower bounds",
                        data: plant.Humidity.map(() => lowerIdealHum),
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


    } catch (err) {
        console.error("Error loading history:", err);
    }
};

loadPlantHistory();