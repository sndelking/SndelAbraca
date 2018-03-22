$(document).ready(initialize);
const $roomID = window.location.href.split('/').slice(-1)[0];
var $room = null;
var $self = null;

var $doneAnimation = false;
function initialize() {
	$room = null;
	$self = null;
	initData();
	// initFab();
};
function initData() {
	$.get(`/refresh`, (res, status) => {
		if (status == "success") {
			var data = $.parseJSON(res);
			$room = data.room;
			$self = data.playerPos;
			$("#roomID").html("房间 " + $room.id);
			$("#self").find("h5").html($room.players[$self].name);
			$("#self").find("pos").html($self + 1);
			$("#self").attr("position", $self);
			update();
		}
	});
};
function update() {
	// $.post("/checkPlayer", {}, function(response, status){});
	refresh();
	// if(!$started)
	// 	checkStarted();
	// else{
	// 	$doneAnimation = true;
	// 	getMsg();}
	setTimeout(()=>update(), 2000);
};
function checkStarted() {
	$.post("/checkStarted", { "roomID": $room.id }, function (response, status) {
		if (status == "success") {
			if ($.parseJSON(response).started) {
				$started = true;
				$(".wrap").remove();
				changeFab("check", false);
				$(".FAB").get(0).addEventListener('transitionend', changable);
				initFab();
			}
		}
	});
};
function getMsg() {
	$.post("/getMsg", { "roomID": $room.id }, function (response, status) {
		if (status == "success") {
			var msg = $.parseJSON(response).msg;
			if (msg) {
				var type = msg[0];
				if (type == 0) {
					drawPlayerTakeCards(msg);
				}
				else if (type == 1) {
					drawUseCard(msg);
				}
				else if (type == 2) {
					drawPlayerDead(msg);
				}
			}
		}
	});
}
function changable() {
	$(".FAB").get(0).removeEventListener('transitionend', changable);
	$doneAnimation = true;
}
function handleFAB() {
	$(".FAB").unbind("click");
	if ($started)
		$(".FAB").click(showCommandList);
	else
		$(".FAB").click(ready);
};