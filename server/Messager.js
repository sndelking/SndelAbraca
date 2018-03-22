export default class Messager {
    constructor(room) {
        this.room = room;
        this.room.players.map(player => player.messageList = []);
    }
    create(code, contents) {
        let msg = { code: code, contents: contents };
        this.room.players.map(player => player.messageList.push(msg));
    }
}