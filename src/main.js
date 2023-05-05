import Phaser from "phaser";
import Game from "./scenes/game";
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';

// var resizeMobile = () => {
// 	var viewport = document.querySelector('meta[name="viewport"]');
// 	var scale = 1.3 / window.devicePixelRatio;
// 	console.log(scale);
// 	viewport.setAttribute('content', 'width=device-width, initial-scale=' + scale + ', maximum-scale=' + scale + ', user-scalable=no');

// 	if (window.innerHeight < window.innerWidth) {
// 		window.scrollTo(0, 1);
// 	}
// }
// resizeMobile();

// window.onresize = function(event) {
// 	resizeMobile();
// };

const config = {
	width: window.innerWidth,
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
	},
	input: {
		activePointers: 2,
	}
}

const game = new Phaser.Game(config);
game.scene.add('game', Game);
game.scene.start('game');
