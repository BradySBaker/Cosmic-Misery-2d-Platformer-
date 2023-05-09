module.exports = {
	startMenu: (game, toggleFullScreen) => {
		var start = (menu) => {
			menu.remove();
			game.scene.start("game");
		}

		const menu = document.createElement("div");

		const startMessage = document.createElement("p1");
		startMessage.innerHTML = "Comsic Misery";

		const fullscreenButton = document.createElement("button");
		fullscreenButton.id = "fullscreen-button";
		fullscreenButton.innerHTML = "Fullscreen";

		const startButton = document.createElement("button");
		startButton.id = "start-button";
		startButton.innerHTML = "BEGIN";
		startButton.style.backgroundColor = 'blue';
		startButton.style.color = 'green'

		const androidMessage = document.createElement("p");
		androidMessage.innerHTML = "Note if on android exit desktop mode in chrome settings!";

		menu.append(startMessage, fullscreenButton, startButton, androidMessage);
		menu.id = "start";

		document.body.appendChild(menu);

		var handleFullscreen = () => {game.fullscreen = true; toggleFullScreen()}

		fullscreenButton.addEventListener("click", handleFullscreen);

		startButton.addEventListener("click", (e) => {fullscreenButton.removeEventListener("click", handleFullscreen); start(menu)}, {once:true});
	},

	deathMenu: (game) => {
		var restart = (menu) => {
			menu.remove();
			game.scene.restart();
		}

		const menu = document.createElement("div");

		const deathMessage = document.createElement("p1");
		deathMessage.innerHTML = 'You Died';

		const pointsMessage = document.createElement("p2");
		pointsMessage.innerHTML = `Enemies Killed - ${game.enemiesKilled}`;

		const button = document.createElement("button")
		menu.append(deathMessage, pointsMessage, button);
		menu.id = "death";
		button.innerHTML = "START";

		document.body.appendChild(menu);
		button.addEventListener("click", () => restart(menu, game));

	}
}
