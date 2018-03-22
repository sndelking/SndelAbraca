document.write("<script src='js/data.js'></script>")
document.write("<script src='js/common.js'></script>")
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
function joinRoom() {
  $.post(
    "/enterRoom",
    { roomID: $("#roomID").val(), name: $("#name").val() },
    (res, status) => {
      if (status == "success") {
        var data = JSON.parse(res);
        if (data.code == 0) window.location.href = 'game';
        else joinFailed(data.code);
      }
    }
  );
}
function joinFailed(code) {
  if (code == 1) callSnackBar("加入房间失败。房间已经开始游戏了。");
  else if (code == 2) callSnackBar("加入房间失败。房间人数已经满了，目前尚未开放观战功能。");
}
