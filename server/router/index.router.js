import RouterRoom from "./room.router";
import RouterGame from "./game.router"
import GameSys from '../structure/GameSys'
export default class RouterListener {
    static addListener(app){
        RouterRoom.addListener(app, GameSys);
        RouterGame.addListener(app, GameSys);
    }
}
module.exports = RouterListener