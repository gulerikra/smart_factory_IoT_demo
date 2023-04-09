const express = require('express');
const app = express();
const { exec } = require('child_process');

app.use(express.static('public'));

// İlk resim dosya adını ayarla
let imageFilename = "image.jpg";

exec('python camera.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

// Periyodik olarak yeni görüntüleri kontrol edin ve dosya adını güncelleyin
setInterval(() => {
  let newFilename = null;
  // Yeni resim dosya adlarını kontrol etme kodunuz buraya gelir
  // Örneğin, "public" dizinindeki dosyaların değiştirilme zamanını kontrol edebilirsiniz.
  // Yeni bir görüntü bulunursa, yeni dosyanın adını yeni Dosyaadı olarak ayarlayın
  if (newFilename !== null && newFilename !== imageFilename) {
    // Yeni bir resim bulundu, dosya adını güncelleyin ve konsola bildirin
    console.log(`New image found: ${newFilename}`);
    imageFilename = newFilename;

    // Görüntüyü güncellemek için tüm bağlı istemcilere bir mesaj gönderin
    io.emit('image', imageFilename);
  }
}, 1000);

// Web sayfasını sunun ve görüntülenen resmi dinamik olarak güncelleyin
const server = app.listen(3000, function () {
  console.log('Sunucu 3000 numaralı portta çalışıyor.');
});

// Socket.IO'yu kurun
const io = require('socket.io')(server);

io.on('connection', function (socket) {
// Bağlandıklarında istemciye geçerli resim dosya adını gönder
  socket.emit('image', imageFilename);
});

// HTML dosyasını istemciye gönder
app.get('/', function (req, res) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Web Kamera</title>
        <meta http-equiv="refresh" content="3"> <!-- Refresh the page every 3 seconds -->
        <script src="/socket.io/socket.io.js"></script>
        <script>
          // Connect to the Socket.IO server
          const socket = io();

          // When the image message is received, update the image on the page
          socket.on('image', function (filename) {
            const img = document.querySelector('img');
            img.src = '/' + filename;
          });
        </script>
      </head>
      <body>
        <h1>Web Kamera</h1>
        <img src="/${imageFilename}" alt="Çekilen Resim" width="640" height="480">
      </body>
    </html>
  `);
});

// http modülünü kullanarak yeni bir sunucu oluşturun
const http = require('http');
const port = 4000;

const requestHandler = (request, response) => {
  let body = '';
  request.on('data', (data) => {
    body += data;
  });
  request.on('end', () => {
    console.log(body);
  });
  response.end('OK');
};

const newServer = http.createServer(requestHandler);

newServer.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`New server is listening on ${port}`);
});
