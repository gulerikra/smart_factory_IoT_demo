const express = require('express')
const app = express()
const { exec } = require('child_process');

app.use(express.static('public'))
exec('python camera.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.listen(3000, function () {
  console.log('Sunucu 3000 numaralı portta çalışıyor.')
})
