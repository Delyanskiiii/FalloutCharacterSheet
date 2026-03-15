const { BrowserWindow, app, shell } = require('electron/main')

const express = require('express');
const path = require('node:path')
const os = require('os');
const fs = require('fs');

const server = express();
const sheetsDir = path.join(__dirname, 'sheets');

server.use(express.json());
server.use(express.static('frontend/build'));
server.listen(PORT, '0.0.0.0', () => {});

app.whenReady().then(() => {
  const win = new BrowserWindow({ show: false });
  win.minimize();
  shell.openExternal(`http://localhost:3000/`);
})

// List of character sheets
server.get('/api/sheets', (req, res) => {
  fs.readdir(sheetsDir, (err, files) => {
    if (err) return res.status(500).send("Could not read sheets folder");
    const characterList = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
    res.json(characterList);
  });
});

// Open specific character sheet
server.get('/api/sheets/:name', (req, res) => {
  const fileName = `${req.params.name}.json`;
  const filePath = path.join(sheetsDir, fileName);
  
  res.sendFile(filePath);
});

// Upload new json to host
server.post('/api/sheets/:name', (req, res) => {
  const charName = req.body.name;
  const filePath = path.join(sheetsDir, `${charName}.json`);
  const updatedData = req.body;

  fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to save character.");
    }
    res.send("Character saved successfully!");
  });
});