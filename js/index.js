document.write("<script src='js/data.js'></script>")
document.write("<script src='js/common.js'></script>")
document.write("<script src='js/format.js'></script>")
$(document).ready(checkJoinedRoom);
function newRoom() {
  $("#newBtn").hide();
  $(".refreshing").show();
  getNewRoomID();
}
function getNewRoomID() {
  $.get("/getNewRoomID", (res, status) => {
    if (status == "success") {
      let data = JSON.parse(res);
      $("#newRoomID").html(data.roomID);
      $("#newRoomID").show();
      $("#roomID").val(data.roomID);
      $(".refreshing").hide();
    }
  });
}
enterRoom = (roomID, name) => {
  $.post(
    "/enterRoom",
    { roomID, name },
    (res, status) => {
      if (status == "success") {
        var data = JSON.parse(res);
        if (data.code == 0) window.location.href = 'game';
        else joinFailed(data.code);
      }
    }
  );
}
function joinRoom() {
  enterRoom($("#roomID").val(), $("#name").val())
}
function joinFailed(code) {
  if (code == 1) callSnackBar("加入房间失败。房间已经开始游戏了。");
  else if (code == 2) callSnackBar("加入房间失败。房间人数已经满了，目前尚未开放观战功能。");
}
function checkJoinedRoom() {
  $.get("/getJoinedRoom", (res, status) => {
    if (status == "success") {
      let data = JSON.parse(res);
      if (data.status) {
        $("#appBar").after(Format.reconnectCard(data.roomID));
        $("#name-card").css("margin-top", 0);
        initAppBarAfter();
        initButtons();
      }
    }
  })
}
function reconnectRoom(roomID) {
  enterRoom(roomID, $("#name").val())
}