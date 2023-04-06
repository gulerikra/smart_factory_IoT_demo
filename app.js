const express = require('express')
const app = express()
const { exec } = require('child_process');

app.use(express.static('public'))

// Set the initial image filename
let imageFilename = "image.jpg";

exec('python camera.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });

// Periodically check for new images and update the filename
setInterval(() => {
  let newFilename = null;
  // Your code to check for new image filenames goes here
  // For example, you could check the modification time of the files in the "public" directory
  // If a new image is found, set newFilename to the name of the new file

  if (newFilename !== null && newFilename !== imageFilename) {
    // A new image has been found, update the filename and notify the console
    console.log(`New image found: ${newFilename}`);
    imageFilename = newFilename;

    // Send a message to all connected clients to update the image
    io.emit('image', imageFilename);
  }
}, 1000);

// Serve the webpage and dynamically update the displayed image
const server = app.listen(3000, function () {
  console.log('Sunucu 3000 numaralı portta çalışıyor.')
})

// Set up Socket.IO
const io = require('socket.io')(server);

io.on('connection', function (socket) {
  // Send the current image filename to the client when they connect
  socket.emit('image', imageFilename);
});

// Send the HTML file to the client
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
  `)
});
