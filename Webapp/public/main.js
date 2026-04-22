const inputButton = document.getElementById('inputButton');

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
    const text = document.getElementById('content');
    text.innerText = plantData.data[0].common_name;
}

inputButton.addEventListener('click', inputClicked)