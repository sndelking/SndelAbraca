import Room from "./Room";
export default class GameSys {
  static newRoom() {
    return {
      status: this.rooms.length < 20,
      roomID:
        this.rooms.length < 20 &&
        this.rooms.push(new Room(this.rooms.length)) &&
        this.rooms.length
    };
  }
  static destoryRoom(id) {
    if (this.rooms.players.length == 0) this.rooms.splice(id, 1);
  }
}
GameSys.rooms = [];
GameSys.ipHash = {};
