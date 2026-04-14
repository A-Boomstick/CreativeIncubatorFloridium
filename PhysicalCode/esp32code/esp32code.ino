#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <DNSServer.h>

// web server on port 80
WifiServer server(80);

//setup dns server
DNSServer dnsServer;

// setup prefrences
Preferences prefrences;

String ssid;
String password;

void handleRoot(){
  // serve web page

}

void handleSaved(){
  //when ssid and pass are saved
}



void APMode(){

  //starts wifi with 
  WiFi.softAP("FloridiumSetup");
  
  //
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());

  server.on("/", root);
  server.on("save", Saved);

  server.begin();

  // Serial.print("Please connect your wifi to FloridiumSetup");
  // Serial.print("Then go to this IP to set up your pot: ");
  // Serial.print(WiFi.softAPIP());
}

void setup(){

  //load / set up prefrences = uses "" ONLY if empty already
  prefrences.begin("wifi, true");
  ssid =  prefrences.getString("SSID", "");
  password =  prefrences.getString("SSID", "");
  prefrences.end();

  Serial.print("current SSID saved: ");
  Serial.print(ssid);

  // if ran for the first time
  if (ssid == "") {
    Serial.println("empty ssid");
    APMode();
    return;
  }



}

void loop() {
  // put your main code here, to run repeatedly:

}
