const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.static(__dirname + "/public/"));

const temperaturePath = "resources/temperature.json";
const precipitationPath = "resources/precipitation.json";

app.get("/api/temperature", function(req, res){

    const content = fs.readFileSync(temperaturePath,"utf8");
    const temperature = JSON.parse(content);
    res.send(temperature);
});

app.get("/api/precipitation", function(req, res){

    const content = fs.readFileSync(precipitationPath,"utf8");
    const precipitation = JSON.parse(content);
    res.send(precipitation);
});

app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});