const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http:/localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get all PlayerList With Details//
app.get("/players/", async (request, response) => {
  const listOfAllPlayers = `
    SELECT * 
    FROM cricket_team;`;
  const allPlayerArray = await db.all(listOfAllPlayers);

  /*Convert this database object into the response 
  object by the function convertDbObjectToResponseObject*/
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allPlayerArray.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Add Player//
app.post("/players/", async (request, response) => {
  const addPlayerDetail = request.body;
  console.log(addPlayerDetail);
  const { playerName, jerseyNumber, role } = addPlayerDetail;

  const addPlayerQuery = `
  INSERT INTO 
  cricket_team(player_name, jersey_number, role)
  VALUES
  ('${playerName}', ${jerseyNumber}, '${role}')`;

  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastId;
  console.log(dbResponse);
  response.send("Player Added to Team");
});

//Get any single player(provided by player_id) detail//
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  console.log(request);
  console.log(request.params);
  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id=${playerId}`;
  const player = await db.get(getPlayerQuery);
  
  let camelCasePlayer = {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role};
  response.send(camelCasePlayer);
});

//Updates player details in the team(database) based on player ID//
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName, jerseyNumber, role } = playerDetail;
  console.log(playerName);
  const updatePlayerQuery = `
    UPDATE cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE player_id=${playerId}
    `;
  console.log(updatePlayerQuery);
  const updatedPlayer = await db.run(updatePlayerQuery);
  console.log(updatedPlayer);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player Id//
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  console.log(request.params);
  const deletePlayerQuery = `
    delete
    FROM cricket_team
    WHERE player_id=${playerId}`;
  const deletedPlayer = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
