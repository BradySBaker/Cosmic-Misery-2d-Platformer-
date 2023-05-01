import Phaser from "phaser";
import Game from "./scenes/game";
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';


const config = {
	width: 945,
	height: 800,
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
	}
}

const game = new Phaser.Game(config);
game.scene.add('game', Game);
game.scene.start('game');
