import bodyParser from "body-parser";
var urlencodedParser = bodyParser.urlencoded({ extended: true });
export default class RouterRoom {
  static addListener(app, GameSys) {
    app.get("/rooms", (req, res) => {
      let data = {
        rooms: GameSys.rooms.map(room => {
          return {
            roomID: room.id,
            playersNum: room.players.length,
            status: room.status
          };
        })
      };
      res.end(JSON.stringify(data));
    });
    app.get("/rooms/new", (req, res) => {
      var data = GameSys.newRoom();
      res.end(JSON.stringify(data));
    });

    app.post("/room/enter", urlencodedParser, (req, res) => {
      let joinRoomID = req.body.roomID;
      let joinRoom = GameSys.rooms[joinRoomID];
      let ip = req.connection.remoteAddress;
      let player = GameSys.ipHash[ip];
      let oldRoomID = player ? player.roomID : null;
      let oldRoom = oldRoomID ? GameSys.rooms[oldRoomID] : null;
      let data = { code: 0 };
      if (joinRoomID != oldRoomID) {
        data.code = joinRoom.joinableCode();
        if (data.code == 0) {
          oldRoom ? oldRoom.removePlayer(ip) : null;
          GameSys.ipHash[ip] = joinRoom.addPlayer(ip, req.body.name);
        }
      }
      res.end(JSON.stringify(data));
    });
  }
}
