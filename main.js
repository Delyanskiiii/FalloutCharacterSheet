const { BrowserWindow, app, shell } = require('electron/main')
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const server = express()
const PORT = 3000
const gameDir = __dirname
const dataDir = path.join(gameDir, 'data')

server.use(cors())
server.use(express.json())
server.use(express.static('frontend/build'))

function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, text) => {
      if (err) return reject(err)
      try {
        resolve(JSON.parse(text))
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}

function writeJsonFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

let currentSystemName = null

function setCurrentSystem(name) {
  currentSystemName = name ? String(name) : null
  return currentSystemName
}

function getCurrentSystemName() {
  return currentSystemName
}

function getDataFilePaths() {
  return new Promise((resolve, reject) => {
    fs.readdir(dataDir, (err, files) => {
      if (err) return reject(err)
      resolve(files.filter(file => file.endsWith('.json')).map(file => path.join(dataDir, file)))
    })
  })
}

async function getAllSystems() {
  const files = await getDataFilePaths()
  const items = await Promise.all(files.map(async file => {
    try {
      return await readJsonFile(file)
    } catch {
      return null
    }
  }))
  return items.filter(Boolean).filter(item => item.type === 'system')
}

async function getCurrentSystem() {
  if (!currentSystemName) return null
  const targetName = String(currentSystemName || '').toLowerCase()
  const systems = await getAllSystems()
  return systems.find(system => String(system.name || '').toLowerCase() === targetName) || null
}

async function getCharactersForCurrentSystem() {
  if (!currentSystemName) return []
  const targetName = String(currentSystemName || '').toLowerCase()
  const files = await getDataFilePaths()
  const items = await Promise.all(files.map(async file => {
    try {
      return await readJsonFile(file)
    } catch {
      return null
    }
  }))

  return items.filter(Boolean).filter(item =>
    item.type === 'character' && String(item.system || '').toLowerCase() === targetName
  )
}

server.get('/api/systems', async (req, res) => {
  try {
    const systems = await getAllSystems()
    res.json(systems)
  } catch (err) {
    res.status(500).json({ error: 'Unable to load systems' })
  }
})

server.post('/api/system', async (req, res) => {
  const system = req.body
  if (!system || !system.name) {
    return res.status(400).json({ error: 'System object with name is required' })
  }

  const filePath = path.join(dataDir, `${system.name}.json`)
  const content = { ...system, type: 'system' }

  try {
    await writeJsonFile(filePath, content)
    setCurrentSystem(system.name)
    res.json({ saved: true, currentSystemName: getCurrentSystemName() })
  } catch (err) {
    res.status(500).json({ error: 'Unable to save system' })
  }
})

server.get('/api/system/current', async (req, res) => {
  try {
    const system = await getCurrentSystem()
    res.json({ currentSystemName: getCurrentSystemName(), system })
  } catch (err) {
    res.status(500).json({ error: 'Unable to load current system' })
  }
})

server.post('/api/system/current', (req, res) => {
  const name = req.body?.name
  const updated = setCurrentSystem(name)
  res.json({ currentSystemName: updated })
})

server.get('/api/characters', async (req, res) => {
  try {
    const characters = await getCharactersForCurrentSystem()
    res.json(characters)
  } catch (err) {
    res.status(500).json({ error: 'Unable to load characters' })
  }
})

server.post('/api/character', async (req, res) => {
  const character = req.body
  if (!character || !character.name) {
    return res.status(400).json({ error: 'Character object with name is required' })
  }

  const filePath = path.join(dataDir, `${character.name}.json`)
  const content = { ...character, type: 'character' }

  try {
    await writeJsonFile(filePath, content)
    res.json({ saved: true })
  } catch (err) {
    res.status(500).json({ error: 'Unable to save character' })
  }
})

server.listen(PORT, '0.0.0.0', () => {})

app.whenReady().then(() => {
  const win = new BrowserWindow({ show: false })
  win.minimize()
  shell.openExternal(`http://localhost:${PORT}`)
})
