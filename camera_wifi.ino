#include <WebServer.h>    // Web sunucusu kütüphanesi
#include <WiFi.h>         // WiFi kütüphanesi
#include <esp32cam.h>     // ESP32-CAM kütüphanesi
 
const char* WIFI_SSID = "ikra";    // WiFi ağ adı
const char* WIFI_PASS = "iKranur8";    // WiFi şifresi
 
WebServer server(80);    // Web sunucusu nesnesi oluşturma
 
// Farklı çözünürlük seçeneklerinin tanımlanması
static auto loRes = esp32cam::Resolution::find(320, 240);
static auto midRes = esp32cam::Resolution::find(350, 530);
static auto hiRes = esp32cam::Resolution::find(800, 600);
 
// JPEG görüntülerin sunulması için bir işlev
void serveJpg()
{
  auto frame = esp32cam::capture();    // Görüntü yakalama işlemi
  if (frame == nullptr) {    // Görüntü yakalama hatası kontrolü
    Serial.println("CAPTURE FAIL");
    server.send(503, "", "");    // Sunucu hatası yanıtı
    return;
  }
  Serial.printf("CAPTURE OK %dx%d %db\n", frame->getWidth(), frame->getHeight(),
                static_cast<int>(frame->size()));    // Görüntü bilgilerinin seri yazdırılması
 
  server.setContentLength(frame->size());    // Sunulan verinin boyutunun ayarlanması
  server.send(200, "image/jpeg");    // Başarılı yanıt kodu ve MIME türü ayarlanması
  WiFiClient client = server.client();    // Sunucuya bağlı olan istemcinin alınması
  frame->writeTo(client);    // Görüntünün istemciye gönderilmesi
}
 
// Düşük çözünürlük için işlev
void handleJpgLo()
{
  if (!esp32cam::Camera.changeResolution(loRes)) {    // Çözünürlük değiştirme hatası kontrolü
    Serial.println("SET-LO-RES FAIL");
  }
  serveJpg();    // JPEG görüntü işleme işlevinin çağrılması
}
 
// Yüksek çözünürlük için işlev
void handleJpgHi()
{
  if (!esp32cam::Camera.changeResolution(hiRes)) {    // Çözünürlük değiştirme hatası kontrolü
    Serial.println("SET-HI-RES FAIL");
  }
  serveJpg();    // JPEG görüntü işleme işlevinin çağrılması
}
 
// Orta çözünürlük için işlev
void handleJpgMid()
{
  if (!esp32cam::Camera.changeResolution(midRes)) {    // Çözünürlük değiştirme hatası kontrolü
