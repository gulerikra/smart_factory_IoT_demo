//esp32-cam için internete bağlanma ve kamera ayarı yapma
#include <WebServer.h>
#include <WiFi.h>
#include <esp32cam.h>
#include <WiFi.h>
#include <WiFiClient.h>
#define gpioPin 12

int pin13 = 13; 

const char* WIFI_SSID = "ssid";
const char* WIFI_PASS = "password";
WebServer server(80);
WiFiClient client;
static auto hiRes = esp32cam::Resolution::find(800, 800);

void serveJpg()
{
  auto frame = esp32cam::capture();
  if (frame == nullptr) {
    Serial.println("CAPTURE FAIL");
    server.send(503, "", "");
    return;
  }
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(),
                static_cast<int>(frame->size()));

  server.setContentLength(frame->size());
  server.send(200, "image/jpeg");
  WiFiClient client = server.client();
  frame->writeTo(client);
}

void handleJpgHi()
{
  if (!esp32cam::Camera.changeResolution(hiRes)) {
    Serial.println("SET-HI-RES FAIL");
  }
  serveJpg();
}

void setup() {
  Serial.begin(115200);
  pinMode(pin13, OUTPUT);
  pinMode(gpioPin, INPUT);

  {
    using namespace esp32cam;
    Config cfg;
    cfg.setPins(pins::AiThinker);
    cfg.setResolution(hiRes);
    cfg.setBufferCount(2);
    cfg.setJpeg(80);

    bool ok = Camera.begin(cfg);
    Serial.println(ok ? "CAMERA OK" : "CAMERA FAIL");
  }

  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);

  // Yeniden bağlanma girişimleri arasındaki bekleme süresini ayarlayın
  WiFi.setSleep(false);
  WiFi.setAutoConnect(false);
  WiFi.setAutoReconnect(false);

  // Bağlantı kesildiğinde otomatik olarak yeniden bağlanmayı etkinleştirin
  WiFi.onEvent([](WiFiEvent_t event) {
    if (event == WiFiEvent_t::SYSTEM_EVENT_STA_DISCONNECTED) {
      Serial.println("Disconnected from WiFi access point");
      WiFi.reconnect();
    }
  });

  // WiFi ağa bağlanmayı deneyin
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("http://");
  Serial.println(WiFi.localIP());
  Serial.println("  /cam-hi.jpg");

  server.on("/cam-hi.jpg", handleJpgHi);

  server.begin();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(pin13, HIGH); // İnternet bağlantısı varsa pin13 HIGH olur
  } else {
    digitalWrite(pin13, LOW); // İnternet bağlantısı yoksa pin13 LOW olur
  }
  server.handleClient();

  if (client.connect("192.168.43.9", 3000)) { // bilgisayarın ip adresi ve port
      int pinState = digitalRead(gpioPin);
      Serial.println(pinState);
    
      // Create the HTTP request
      String request = "POST /data HTTP/1.1\r\n";
      request += "Host: localhost\r\n";
      request += "Content-Type: application/x-www-form-urlencoded\r\n";
      request += "Content-Length: 1\r\n\r\n"; //1 karakter kadar veri gönderir
      request += String(pinState); // pinState değeri veri olarak eklenir
      Serial.println(request);

      client.print(request);

    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }
    client.stop();
  }

}
