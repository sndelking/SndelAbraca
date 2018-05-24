document.write("<script src='js/common.js'></script>");
document.write("<script src='js/data.js'></script>");
document.write("<script src='js/format.js'></script>");
window.addEventListener("load", () => {
  GetStart.getRooms();
});
class GetStart {
  static async getRooms() {
    let res = await $get("/rooms");
    document.getElementById("rooms-list").innerHTML = Format.gameHall(
      res.rooms
    );
  }
  static async checkJoinedRoom() {
    let res = await $get("/joined-room");
    console.log(res);
  }
  static async newRoom() {
    document.getElementById("new-room-button").loading();
    let res = await $get("/rooms/new");
    document.getElementById("new-room-button").loaded();
    if (!res.status) callSnackBar("大厅房间数已达上限，尝试加入已有的房间吧。");
    else this.getRooms();
  }
  static joinRoom() {
    let joiningRoomID = document.getElementById("joining-room-id").value;
    let name = document.getElementById("name").value;
    this.enterRoom(joiningRoomID, name);
  }
  static async enterRoom(roomID, name) {
    let res = await $post("/room/enter", { roomID, name });
    if (res.code == 0) window.location.href = "game";
    else this.joinFailed(data.code);
  }
  static joinFailed(code) {
    if (code == 1) callSnackBar("加入房间失败。房间已经开始游戏了。");
    else if (code == 2)
      callSnackBar("加入房间失败。房间人数已经满了，目前尚未开放观战功能。");
  }
  static reconnectRoom() {
  }
  static randomName() {
    let name =
      adjList[Math.floor(Math.random() * adjList.length)] +
      "的" +
      nList[Math.floor(Math.random() * nList.length)];
    document.getElementById("name").value = name;
  }
}
