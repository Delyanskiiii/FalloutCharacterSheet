const { BrowserWindow, app, shell } = require('electron/main')
const fs = require('fs');

const express = require('express');
const server = express();

const path = require('node:path')
const gameDir = __dirname;

const PORT = 3000;

server.use(express.json());
server.use(express.static('frontend/build'));
server.listen(PORT, '0.0.0.0', () => {});

app.whenReady().then(() => {
  const win = new BrowserWindow({ show: false });
  win.minimize();
  shell.openExternal(`http://localhost:${PORT}`);
})

server.get('/api/game', (req, res) => {
  fs.readdir(gameDir, (err, files) => {
    if (err) return res.status(500).send("Could not read games folder");
    const characterList = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    res.json(characterList);
  });
});

server.get('/api/game/:name', (req, res) => {
  const fileName = `${req.params.name}.json`;
  const filePath = path.join(gameDir, fileName);
  
  res.sendFile(filePath);
});

server.post('/api/game/:name', (req, res) => {
  const charName = req.body.name;
  const filePath = path.join(gameDir, `${charName}.json`);
  const updatedData = req.body;

  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to save character.");
    }
    res.send("Character saved successfully!");
  });
});