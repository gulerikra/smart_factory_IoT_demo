const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');

const port = 3000;
let status = '';

// Statik dosyaları "public" klasöründen sunmak için Express'i yapılandırın
app.use(express.static('public'));

let imageFilename = "C:\\Users\\ikra\\Desktop\\fotocek_webdegoster\\public\\image.jpg";



// Python kamera betiğini çalıştırın
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
// WebSocket sunucusu oluşturulur
const wss = new WebSocket.Server({ noServer: true });

// WebSocket bağlantısı kurulduğunda
wss.on('connection', (ws) => {
  // Yeni bir istemci bağlandığında mevcut status değerini gönderir
  ws.send(status);
});

const requestHandler = (request, response) => {
  let body = '';

  request.on('data', (data) => {
    body += data;
    // Gelen her yeni veri için WebSocket bağlantısına güncel status değerini gönderir
    wss.clients.forEach((client) => {
      client.send(status);
    });
  });

  request.on('end', () => {
    console.log(body);
    if (body === '0') {
      status = 'Motor duruyo';
    } else if (body === '1') {
      status = 'Motor calısıyo';
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(`
      <html>
        <body>
        <h1>MOTOR DURUMU </h1>
          <pre id="status">${status}</pre>
          <script>
            // WebSocket bağlantısı kurar
            const socket = new WebSocket('ws://localhost:${port}');
            
            // WebSocket mesajları alındığında
            socket.onmessage = (event) => {
              // Gelen mesajı pre etiketi içindeki yazıya aktarır
              document.getElementById('status').textContent = event.data;
            };
          </script>
        </body>
        
        <head>
        </script>
        <title>bitirme proje ikra</title>
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
        <h1>HATALI URUN GORSELI</h1>
        <img src="/${imageFilename}" alt="Cekilen Resim" width="640" height="480">
        </script>
        </body>
      </html>
    `); // status değişkenini HTML sayfasına yazdırır
    response.end();
  });
};

const server = http.createServer(requestHandler);

// HTTP sunucusunu başlatır
server.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`New server is listening on ${port}`);
});

// WebSocket sunucusunu HTTP sunucusuna bağlar
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});


// Socket.IO'yu kurun
const io = require('socket.io')(server);

io.on('connection', function (socket) {
  // Bağlandıklarında istemciye geçerli resim dosya adını gönder
    socket.emit('image', imageFilename);
});
