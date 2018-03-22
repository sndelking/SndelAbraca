import Room from "./Room"
export default class GameSys{
	static newRoom() {
		this.rooms.push(new Room(this.rooms.length));
	};
	destoryRoom(id) {
		if(this.rooms.players.length == 0)
			this.rooms.splice(id, 1);
	};
};
GameSys.rooms = [];
GameSys.ipDictionary = {};

module.exports = GameSys;