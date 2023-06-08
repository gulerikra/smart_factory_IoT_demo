const http = require('http');
const WebSocket = require('ws');
const port = 3000;

let status = ''; // Başlangıçta boş bir status değişkeni oluşturulur

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.send(status);
});

const requestHandler = (request, response) => {
  let body = '';

  request.on('data', (data) => {
    body += data;
    wss.clients.forEach((client) => {
      client.send(status);
    });
  });

  request.on('end', () => {
    console.log(body);
    if (body === '0') {
      status = 'MOTOR DURUYOR';
    } else if (body === '1') {
      status = 'MOTOR ÇALIŞIYOR';
    }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(`
      <html>
        <body>
          <h1 style="font-size: 40px;">MOTOR DURUMU</h1>
          <pre id="status" style="font-size: 30px;">${status}</pre>
          <script>
            const socket = new WebSocket('ws://localhost:${port}');

            socket.onmessage = (event) => {
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

server.listen(port, (err) => {
  if (err) {
    return console.log('Something bad happened', err);
  }
  console.log(`New server is listening on ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
