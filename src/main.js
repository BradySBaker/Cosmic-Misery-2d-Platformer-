import Phaser from "phaser";
import Game from "./scenes/game";
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
const config = {
	width: window.innerWidth,
	height: Math.min(Math.max(window.innerHeight, 400), 800),
	backgroundColor: '2c003e',
	type: Phaser.AUTO,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 1000 },
			debug: true
		}
	},
	plugins:{
		global: [
			{key: 'VirtualJoystick', plugin: VirtualJoystickPlugin, start: true}]
	},
	input: {
		activePointers: 2,
	}
}


function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen =
    docEl.requestFullscreen ||
    docEl.mozRequestFullScreen ||
    docEl.webkitRequestFullScreen ||
    docEl.msRequestFullscreen;
  var cancelFullScreen =
    doc.exitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen ||
    doc.msExitFullscreen;

  if (
    !doc.fullscreenElement &&
    !doc.mozFullScreenElement &&
    !doc.webkitFullscreenElement &&
    !doc.msFullscreenElement
  ) {
    requestFullScreen.call(docEl);
  } else {
    cancelFullScreen.call(doc);
  }
}

const fullscreenButton = document.getElementById('fullscreen');


fullscreenButton.addEventListener('click', () => {
toggleFullScreen();
});

const game = new Phaser.Game(config);
const gameScene = game.scene.add('game', Game);
game.scene.start('game');

window.onresize = function(){ location.reload(); } //Reload entire page on window resize

