import Phaser from "phaser";
import Game from "./scenes/game";
import Start from "./scenes/menus/start";

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
			debug: false
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

const game = new Phaser.Game(config);
game.scene.add('game', Game);
game.scene.add('start', Start);
game.scene.start('start'); //Creates fullscreen button


var canvas = game.canvas;

// Set the willReadFrequently attribute to true
canvas.setAttribute('willReadFrequently', 'true');
