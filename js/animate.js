function cardFadeOut(card) {
	card.css('animation', 'gameCardFadeOut 0.485s cubic-bezier(0.4, 0.0, 1, 1)');
	card.get(0).addEventListener('animationend', cardCollapse);
	function cardCollapse() {
		card.get(0).removeEventListener('animationend', cardCollapse);
		card.remove();
	}
};
function shake(jq) {
	jq.addClass("shake");
}