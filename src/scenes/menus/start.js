
import menus from "./index";

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


export default class Game extends Phaser.Scene {
	preload() {
		this.load.image('sky', '..//assets/sky2.png');
		this.load.image('ground', '..//assets/ground2.png');
		this.load.image('mountains1', '..//assets/mountains1.png');
		this.load.image('mountains2', '..//assets/mountains2.png');
	}

	create() {
		this.backgrounds = [];
		this.createBackgrounds();

		menus.startMenu(this, toggleFullScreen);

		var scene = this;

		document.getElementById('fullscreen');
		window.onresize = function(){ if (!scene.fullscreen) {location.reload();}} //Reload entire page on window resize
	}

	update() {
		this.handleBackgrounds();
	}

	createBackgrounds() {
		this.add.image(-window.innerWidth/4, -500, 'sky')
		.setOrigin(0, 0)
		.setScale(1.3);

		this.backgrounds.push({
			ratioX: 0.1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 450, 'mountains2')
			.setOrigin(0,0)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 0.4,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 450, 'mountains1')
			.setOrigin(0,0)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 600, 'ground')
			.setOrigin(0,0)
			.setScale(1.4)
		})
	}

	handleBackgrounds() {
		for (let i =0 ; i< this.backgrounds.length; i++) {
			const bg = this.backgrounds[i];

			bg.sprite.tilePositionX += bg.ratioX/1.4;
		}
	}

}