const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbResponseToOjectResponse = dbObj => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    jerseyNumber: dbObj.jersey_number,
    role: dbObj.role,
  }
}
app.get('/players/', async (request, response) => {
  const a = `select * from cricket_team`
  const b = await db.all(a)
  response.send(b.map(i => convertDbResponseToOjectResponse(i)))
})

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `INSERT INTO cricket_team(player_name,jersey_number,role)
  VALUES('${playerName}',${jerseyNumber},'${role}')`
  const player = await db.run(postPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`
  const player = await db.get(getPlayerDetails)
  response.send(convertDbResponseToOjectResponse(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET 
      player_name = '${playerName}',
      jersey_number = '${jerseyNumber}',
      role = '${role}'
    WHERE 
      player_id = '${playerId}';
  `
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId}`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
