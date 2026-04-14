void setup() {
  Serial.begin(9600); // Initialize serial communication for debugging
}

void loop() {
  int sensorValue = analogRead(A0); // Read the analog value from the sensor
  Serial.print("Soil Moisture Level: ");
  Serial.println(sensorValue);
  delay(1000); // Delay for one second before the next reading
}
