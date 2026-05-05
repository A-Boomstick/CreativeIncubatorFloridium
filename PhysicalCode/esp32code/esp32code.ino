#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <DNSServer.h>
#include "Adafruit_SHT4x.h"
// #include <ArduinoJson.h>

// web server on port 80
WebServer server(80);

//setup dns server
DNSServer dnsServer;
const byte DNS_PORT = 53;

// setup prefrences
Preferences prefrences;

TaskHandle_t POSTTask;

Adafruit_SHT4x sht4 = Adafruit_SHT4x();

String ssid;
String password;
bool shouldRestart = false;

float tempReading;
float humidityReading;



static const String htmlPage = R"===(
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Floridium Set Up!</title>
</head>
<body style="display: flex; flex-direction: column; align-items:center;">
    <h1 style="color: #5EAF5E; margin-bottom: 0px;">Floridium<span style="color: black;">,</span></h1>
    <h2 style="margin-top: 0px;">A smart plant pot</h2>
    <p>To connect your plant pot to the internet, we need to connect to your router!</p>
    <p>Please enter your SSID (the name of your wifi that you normally connect to) and the password for it!</p>

    <p>SSID:</p>
    <input id="ssid">
    <p>Password:</p>
    <input id="password" type="password">
    <button onclick="saveData()">Save</button>
    <script>
      function saveData(){
        let ssid = document.getElementById("ssid").value;
        let password = document.getElementById("password").value;

        //fetch request parsing the ssid and password data
        fetch(`/save?ssid=${ssid}&password=${password}`)
          .then(res => res.text())
          .then(data => {
            document.body.innerHTML = data;
          });
      }
    </script>
</body>
</html>
)===";

void handleRoot() {
  // serve web page
  server.send(200, "text/html", htmlPage);
}

void handleSaved() {
  //when ssid and pass are saved

  //recieve the data that was sent from html file
  ssid = server.arg("ssid");
  password = server.arg("password");

  //save data to prefrences
  prefrences.begin("wifi", false);
  prefrences.putString("ssid", ssid);
  prefrences.putString("password", password);
  prefrences.end();

  server.send(200, "text/html", "You have saved a network!");

  shouldRestart = true;
}

void handleNotFound() {
  //if a route isnt / or /save, send it to (/)
  server.sendHeader("Location", "/");
  server.send(302, "text/plain", "redirect tp captive portal");
}

void APMode() {

  //starts wifi with
  WiFi.softAP("FloridiumSetup");

  //start the dns server
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  server.on("/", handleRoot);
  server.on("/save", handleSaved);

  server.onNotFound(handleNotFound);

  server.begin();

  // Serial.print("Please connect your wifi to FloridiumSetup");
  // Serial.print("Then go to this IP to set up your pot: ");
  // Serial.print(WiFi.softAPIP());
}


void postRequest() {
  if (WiFi.status() == WL_CONNECTED) {
    //Read data
    Serial.println("going to start reading data: ");

    int sunReading = 50;
    
    // Read the analog value from the soil sensor
    int soilReading = analogRead(33);
    Serial.print("soil : ");
    Serial.println(soilReading);

    delay(150);

    sensors_event_t humidity, temp;
    sht4.getEvent(&humidity, &temp);
    Serial.print("temp : ");
    Serial.println(temp.temperature);
    Serial.print("humid : ");
    Serial.println(humidity.relative_humidity);

    tempReading = temp.temperature;
    humidityReading = humidity.relative_humidity;


    HTTPClient http;
    http.begin("https://creativeincubatorfloridium.onrender.com/data");
    http.addHeader("Content-Type", "application/json");



    String json = "{";
    json += "\"box_id\":\"Floridium01\",";
    json += "\"soil_moisture\":" + String(soilReading) + ",";
    json += "\"temperature\":" + String(tempReading) + ",";
    json += "\"sunlight_reading\":" + String(sunReading) + ",";
    json += "\"humidity\":" + String(humidityReading);
    json += "}";

    Serial.println(json);

    int httpResponseCode = http.POST(json);


    Serial.print("Response: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode == -11) {
      delay(5000);
      httpResponseCode = http.POST(json);
    }

    http.end();
  } else {
    Serial.print("Couldn't connect to the network!");
  }
}


void POSTTaskcode(void* parameter) {
  for (;;) {  //infinite loop
    //attempt to conenct to wifi
    // WiFi.begin(ssid, password);

    // int attempts = 0;
    // while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    //   delay(500);
    //   Serial.print(".");
    //   attempts++;
    // }

    if (WiFi.status() == WL_CONNECTED) {
      postRequest();

    } else {
      Serial.print("Can't connect to the network! POST request not sent");
    }

    // //delay for an hour
    // vTaskDelay(3600000 / portTICK_PERIOD_MS);

    //delay for short time
    vTaskDelay(14000 / portTICK_PERIOD_MS);
  }
}


void setup() {
  Serial.begin(115200);

  // prefrences.begin("wifi", false);
  // prefrences.end();

  //load / set up prefrences = uses "" ONLY if empty already
  prefrences.begin("wifi", true);
  ssid = prefrences.getString("ssid", "");
  password = prefrences.getString("password", "");
  prefrences.end();

  Serial.print("current SSID saved: ");
  Serial.print(ssid);

  // if ran for the first time
  if (ssid == "") {
    Serial.println("empty ssid");
    APMode();
    return;
  }

  sht4.begin();
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {


    Serial.print("Connected to network!");

    //setup sensors
    sht4.setPrecision(SHT4X_HIGH_PRECISION);
    sht4.setHeater(SHT4X_LOW_HEATER_100MS);


    //create a task to run on core 0 - this keeps the post requests running seperate from the wifi setup.
    xTaskCreatePinnedToCore(
      POSTTaskcode,
      "POSTTask",
      25000,
      NULL,
      1,
      NULL,
      1);


  } else {
    Serial.print("Not connected to network");
    APMode();
  }
}


void loop() {

  if (ssid == "") {
    dnsServer.processNextRequest();
    server.handleClient();
    return;
  }

  //restart esp as a network has been saved
  if (shouldRestart) {
    ESP.restart();
  }
}
