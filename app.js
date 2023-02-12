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

module.exports = app;
