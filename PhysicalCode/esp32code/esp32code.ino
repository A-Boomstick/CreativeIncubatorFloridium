#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <DNSServer.h>

// web server on port 80
WebServer server(80);

//setup dns server
DNSServer dnsServer;
const byte DNS_PORT = 53;

// setup prefrences
Preferences prefrences;

TaskHandle_t POSTTask;


String ssid;
String password;
bool shouldRestart = false;

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
    HTTPClient http;
    http.begin("https://the-tarot-archive-box.onrender.com/data");
    http.addHeader("Content-Type", "application/json");

    String json = R"({
      "box_id": "TEST123",
      "event": "data!"
    })";

    int httpResponseCode = http.POST(json);

    
    Serial.print("Response: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode == -11){
      delay(5000);
      httpResponseCode = http.POST(json);
    }

    http.end();
  } 
  else {
    Serial.print("Couldn't connect to the network!");
  }
}


void POSTTaskcode(void* parameter) {
  for (;;) {  //infinite loop
    if (WiFi.status() == WL_CONNECTED) {
      postRequest();

    } else {
      Serial.print("Can't connect to the network! POST request not sent");
    }

    //delay for an hour
    vTaskDelay(3600000 / portTICK_PERIOD_MS);
  }
}


void setup() {
  Serial.begin(115200);

  prefrences.begin("wifi", false);
  prefrences.remove(numberOfAttemptsToConnect);
  prefrences.end();

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

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".") #attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected to network!");

      //create a task to run on core 0
      xTaskCreatePinnedToCore(
        POSTTaskcode,
        "POSTTask",
        10000,
        NULL,
        1,
        NULL,
        0);


  } else {
    Serial.print("Not connected to network")
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
