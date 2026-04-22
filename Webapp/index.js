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
        console.log(data)
        response.send(data);
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