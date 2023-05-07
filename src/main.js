import Phaser from "phaser";
import Game from "./scenes/game";
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
const config = {
	width: window.innerWidth,
	height: Math.min(Math.max(window.innerHeight, 200), 800),
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


//Handle fullscreen on mobile

document.body.style.height = (window.innerHeight *1.5) + 'px'; //a lot of pixels or a large precentage
window.scrollTo(0, 1); // moves the viewport to the top
document.body.style.height = '100vh'; // OR clientHeight + 'px' OR something

var element = document.body;

var requestMethod = element.requestFullScreen ||
              element.webkitRequestFullscreen ||
              element.webkitRequestFullScreen ||
              element.mozRequestFullScreen ||
              element.msRequestFullscreen;

if( requestMethod ) {
	requestMethod.apply( element );
}

const game = new Phaser.Game(config);
const gameScene = game.scene.add('game', Game);
game.scene.start('game');

