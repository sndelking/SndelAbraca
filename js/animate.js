function cardFadeOut(card) {
	card.css('animation', 'gameCardFadeOut 0.575s cubic-bezier(0.4, 0.0, 1, 1)');
	card.get(0).addEventListener('animationend', cardCollapse);
	function cardCollapse() {
		card.get(0).removeEventListener('animationend', cardCollapse);
		card.remove();
	}
};
function shake(jq) {
	jq.addClass("shake");
};
function abracaSucceed(card, top, left) {
	callMask();
	$("body").append(Format.abracaAnimation(card, top, left));
	let abracaAnimationJqNode = $("animation-abraca");
	abracaAnimationJqNode.get(0).addEventListener('animationend', animationEnd);
	function animationEnd() {
		abracaAnimationJqNode.get(0).removeEventListener('animationend', animationEnd);
		abracaAnimationJqNode.remove();
		hideMask();
	}
}