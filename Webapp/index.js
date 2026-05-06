require('dotenv').config();

const express = require("express");
const app = express();

const path = require('path');

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.listen(3000, () => console.log("Listening on http://localhost:3000"));

async function postExample(request, response) {
    const data = await fetch(process.env.TREFLE_URL);
    const json = await data.json();
    console.log(json);
    response.send(json);
}

async function searchExample(request, response) {
    /*const data = await fetch("https://trefle.io/api/v1/plants/search", {
        token: process.env.TREFLE_TOKEN,
        body:
    })
    */

    try {
        const test = await fetch("https://trefle.io/api/v1/plants/search?q=" + request.body.name + "&token=" + process.env.TREFLE_TOKEN)
        const data = await test.json()
        //console.log(data)
        console.log(data.data[0].slug)
        //response.send(data);
        console.log("Second request below")
        const test2 = await fetch("https://trefle.io/api/v1/plants/" + data.data[0].slug + "?token=" + process.env.TREFLE_TOKEN)
        const data2 = await test2.json()
        console.log(data2.data.main_species.growth)
        response.send(data2);
    }
    catch (error) {
        console.log("Error, ", error);
    }

    
}

app.post("/search", searchExample);

app.get("/example", postExample);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'placeholder.html'));
}); 