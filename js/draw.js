function drawPlayer(pos, name) {
	var playerHtml = "<div class='player card' position="+
			pos+"><face></face><div class='info'><h5 class='name'>"+
			name+"</h5><pos>"+
			(pos+1)+
			"</pos><charactor></charactor></div><game-cards><collector></collector></game-cards></div>";
	if(pos > $self && $(".players-collector.right").find(".player").length < 2)
		$(".players-collector.right").append(playerHtml);
	else if(pos != $self)
		$(".players-collector.left").append(playerHtml);
};
function drawPlayerInfo(pos) {
	player(pos).find(".info").append("<label class='icon hp'></label><label class='icon cards'></label><label class='icon previse'></label>");
	for(var j=0; j<3; j++)
		redrawPlayerInfo(pos, j);
	player(pos).find("face").css('background-image', 'url(img/'+charactorImgUrl[$room.players[pos].charactor]+'.jpg)');
	player(pos).find("charactor").html(charactorName[$room.players[pos].charactor]);
};
function drawPlayerCard(pos, cardNo) {
	player(pos).find("collector").append("<div class='game-card' no="+cardNo+"></div>");
};
function drawPlayerStyle() {
	$(".player").each(function(){
		$(this).removeClass('now');
	});
	$("#self").removeClass('now');
	player($room.nowPlayer).addClass('now');
};
function redrawPlayerInfo(pos, index) {
	var datas = [$room.players[pos].hp, $room.players[pos].cards.length, $room.players[pos].owls.length];
	var labeljq = player(pos).find("label").eq(index);
	if(parseInt(labeljq.html()) != datas[index])
		labeljq.html(datas[index]);
};