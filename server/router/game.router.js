import bodyParser from "body-parser";
var urlencodedParser = bodyParser.urlencoded({ extended: false });
export default class RouterGame {
  static addListener(app, GameSys) {
    app.get("/refresh", (req, res) => {
      let player = GameSys.ipHash[req.connection.remoteAddress];
      let playerPos = player ? player.pos : null;
      let data = {
        room: GameSys.rooms[player.roomID].info(playerPos),
        playerPos: playerPos
      };
      res.end(JSON.stringify(data));
    });
    app.post("/ready", (req, res) => {
      let player = GameSys.ipHash[req.connection.remoteAddress];
      let room = GameSys.rooms[player.roomID];
      let playerPos = player ? player.pos : null;
      let data = { code: 1 };
      if (playerPos !== null) {
        room.ready(playerPos);
        data.code = 0;
      }
      res.end(JSON.stringify(data));
    });
    app.post("/unready", (req, res) => {
      let player = GameSys.ipHash[req.connection.remoteAddress];
      let room = GameSys.rooms[player.roomID];
      let playerPos = player ? player.pos : null;
      let data = { code: 1 };
      if (playerPos !== null) {
        room.unready(playerPos);
        data.code = 0;
      }
      res.end(JSON.stringify(data));
    });

    app.post("/execute-card", urlencodedParser, function(req, res) {
      let cardNum = Number(req.body.cardNum);
      let player = GameSys.ipHash[req.connection.remoteAddress];
      let playerPos = player ? player.pos : null;
      let roomID = player ? player.roomID : null;
      let room = GameSys.rooms[roomID];
      let status = room.executeCard(cardNum, playerPos);
      let data = {
        status: status,
        room: room,
        playerPos: playerPos
      };
      res.end(JSON.stringify(data));
    });

    app.post("/end-turn", (req, res) => {
      let player = GameSys.ipHash[req.connection.remoteAddress];
      let room = GameSys.rooms[player.roomID];
      let playerPos = player ? player.pos : null;
      if (playerPos !== null) room.endTurn();
      let data = {
        room: GameSys.rooms[player.roomID].info(playerPos),
        playerPos: playerPos
      };
      res.end(JSON.stringify(data));
    });
  }
}
