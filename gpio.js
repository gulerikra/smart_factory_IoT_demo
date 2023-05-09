// motor çalışıyor/ duruyor sinyal güzelce gelip değişiyor

const http = require('http');
const WebSocket = require('ws');
const port = 3000;

let status = ''; // Başlangıçta boş bir status değişkeni oluşturulur

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
