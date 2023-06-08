//esp32-cam kamersaından veri alma, işleme ve html ekranında gösterme
const express = require('express');
const app = express();
const { exec } = require('child_process');

app.use(express.static('public'));

let imageFilename = "image.jpg";

exec('python camera.py', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

setInterval(() => {
  let newFilename = null;
  if (newFilename !== null && newFilename !== imageFilename) {
    console.log(`New image found: ${newFilename}`);
    imageFilename = newFilename;

    io.emit('image', imageFilename);
  }
}, 1000);

const server = app.listen(4000, function () {
  console.log('Sunucu 4000 numarali portta çalisiyor.');
});

const io = require('socket.io')(server);

io.on('connection', function (socket) {
  socket.emit('image', imageFilename);
});

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
        <h1>HATALI GORSEL</h1>
        <img src="/${imageFilename}" alt="Çekilen Resim" width="640" height="480">
      </body>
    </html>
  `);
});
