const inputButton = document.getElementById('inputButton');

const testData = {
    'light': 5,
    'temperature': 28,
    'moisture': 6
};

async function inputClicked(event) {
    const searchName = document.getElementById('testInput').value;

    const data = {
        name: searchName
    };

    const response = await fetch("/search", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const plantData = await response.json();
    const name = document.getElementById('content');
    const light = document.getElementById('content2');
    const temp = document.getElementById('content3');
    const moisture = document.getElementById('content4');
    name.innerText = plantData.data.common_name;
    light.innerText = plantData.data.main_species.growth.light;
    temp.innerText = plantData.data.main_species.growth.maximum_temperature.deg_c;
    moisture.innerText = plantData.data.main_species.growth.soil_humidity;

}

inputButton.addEventListener('click', inputClicked)