import Phaser from "phaser";
import CharacterController from "./spriteControllers/characterController";
import enemy1Controller from "./spriteControllers/enemy1Controller";
import projectileController from "./spriteControllers/projectileController";

import menus from "./menus/index";
export default class Game extends Phaser.Scene {
	preload() {
		this.load.image('sky', '..//assets/sky2.png');
		this.load.image('ground', '..//assets/ground2.png');
		this.load.image('mountains1', '..//assets/mountains1.png');
		this.load.image('mountains2', '..//assets/mountains2.png');
		this.load.image('hole', '..//assets/hole.png');
		this.load.atlas('player', '..//assets/player/player.png', '..//assets/player/player.json', true);
		this.load.image('playerArm', '..//assets/player/lArm.png');
		this.load.image('playerForearm', '..//assets/player/lForearm.png');
		this.load.image('projectile', '..//assets/player/projectile.png');
	}

	create() {
		this.gameWidth = window.innerWidth
    this.gameHeight = this.sys.game.canvas.height

		this.input.addPointer(2);

		this.death = false;
		this.char = new CharacterController(this);

		this.enemy1Controller = new enemy1Controller(this);
		this.projectileController = new projectileController(this);

		//Keybinds
		this.char.moveRObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.char.moveLObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.char.jumpObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		this.enemiesKilled = 0;

		this.backgrounds = [];
		this.createBackgrounds();

		this.physics.world.setBoundsCollision(false, false, false, true);
		const graphics = this.add.graphics();

		if (/Mobi/.test(navigator.userAgent)) {
			this.mobile = true;
			this.setupJoystick();
		}

		this.char.createMainCharacter();
		this.enemy1Controller.createEnemy();

		this.physics.world.setBounds(-375, 0, this.innerWidth, this.gameHeight);

		this.gameObjectsGroup = this.add.group({
			callback: (gameObject) => {
				this.quadTree.insert(gameObject);
			}
		});
		var gameObjectsGroup = this.gameObjectsGroup;

	this.enemyTimer = 1000;

	this.setupPlatforms(gameObjectsGroup);
	this.platformDestroyTimer = 1000;
	this.prevGameObjX = 100;
	this.nextPlatformX = 100;
	this.nextHole = 1000;
	this.holeWidth = 200;
	this.prevGround = -(this.nextHole - this.holeWidth);
	this.groundHandler(true);

	this.physics.add.overlap(this.char.self, this.enemy1Controller.enemyGroup, () => {
		this.gameOver();
		this.death = true;
	});

	this.physics.world.enableBodySleeping = true;

var yCameraOffset = 200;
var zoom = .7;

if (this.gameHeight <= 500) {
	zoom = .5;
	yCameraOffset = 0;
}

this.cameras.main.startFollow(this.char.self, true, 0.5, 0.5, 0, yCameraOffset);
this.cameras.main.setZoom(zoom);

this.enemySpawner();

if (this.physics.world.isPaused) {
	this.physics.resume();
}
}


	update(time, delta) {
		this.physics.world.collide(this.char.self, this.platformGroup, (char, plat) => this.handePlatformCollision(char, plat)); // Must happen before handleMainChar
		// this.physics.world.setFPS(1000/delta);
		this.deltaTime = delta / (1000 / 60);
		if (this.death) {
			if (!this.char.c.bottom) {
				this.char.self.y++;
			}
			return;
		}
		this.char.handleMainCharacter();
		this.handleObjectPositioning();
		this.handleBackgrounds();
		this.randomPlatformSpawner();
		this.groundHandler();
		this.projectileController.handleProjectiles();
		this.char.c.bottom = false; // resets c bottom to be recalculated next frame
		this.char.c.top = false;
	}


	enemySpawner() {
		if (!this.death) {
			if (this.enemyTimer >= 100) {
				this.enemyTimer -= 1;
			}
			var spawnX = this.char.self.x + this.game.config.width;
			var spawnY = this.char.self.y;
			this.enemy1Controller.spawnEnemy(spawnX, spawnY);
		}
		setTimeout(() => {this.enemySpawner()}, this.enemyTimer);
	}


	createBackgrounds() {
		var skyOffset = -window.innerWidth/4
		if (this.gameHeight <= 500) {
			skyOffset = -window.innerWidth;
		}
		this.add.image(skyOffset, -800, 'sky')
		.setOrigin(0, 0)
		.setScrollFactor(0, .3)
		.setScale(1.3);

		this.backgrounds.push({
			ratioX: 0.1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.6, 450, 'mountains2')
			.setOrigin(0,0)
			.setScrollFactor(0, .6)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 0.4,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.6, 450, 'mountains1')
			.setOrigin(0,0)
			.setScrollFactor(0, .8)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.6, 600, 'ground')
			.setOrigin(0,0)
			.setScrollFactor(0, 1)
			.setScale(1.4)
		})
	}

	handleBackgrounds() {
		for (let i =0 ; i< this.backgrounds.length; i++) {
			const bg = this.backgrounds[i];

			bg.sprite.tilePositionX = this.char.movement.pos.x * bg.ratioX/1.4;
		}
	}


	handleObjectPositioning() {
		this.gameObjectsGroup.children.iterate((gameObject) => {
			if (!gameObject) {
				return;
			}
			if (gameObject.name === 'enemy' && (this.char.c.bottom) ) {
				if (gameObject.x < this.char.self.x && gameObject.body) {
					gameObject.body.setVelocityX(100);
				} else if(gameObject.body){
					gameObject.body.setVelocityX(-100);
				}
			}
			if (gameObject.name === 'platform' || gameObject.name === 'hole') {
				if (this.char.self.x - gameObject.x > window.innerWidth) {
					gameObject.destroy();
					return;
				}
			}
			gameObject.x -= this.char.movement.dx * this.deltaTime;
		});
	}


	gameOver() {
		if (!this.death) {
			this.physics.world.timeScale = 2
			this.char.arm.visible = false;
			this.char.forearm.visible = false;
			this.char.self.play('death');

			setTimeout(() => menus.deathMenu(this), 2000);

		}
	}

	setupJoystick() {
		var base = this.add.graphics();
			base.fillStyle(0xd6d0b8, .5);
			base.fillCircle(0, 0, 50);
		var thumb = this.add.graphics();
			thumb.fillStyle(0x837d7d, .5);
			thumb.fillCircle(0, 0, 25);

		this.joystick = this.plugins.get('VirtualJoystick').add(this, {
			x: 100,
			y: this.gameHeight - 100,
			radius: 50,
			base: base,
			thumb: thumb,
			forceMin: 16,
			enable: true
		});

		var cursorKeys = this.joystick.createCursorKeys();

		this.char.moveRObj = cursorKeys.right;
		this.char.moveLObj = cursorKeys.left;
		this.char.jumpObj = cursorKeys.up;
	}

	setupPlatforms(gameObjectsGroup) {
		this.platformGroup = this.physics.add.group({
			defaultKey: 'platform',
			maxSize: 100,
			createCallback: function(platform) {
				platform.name = 'platform';
				gameObjectsGroup.add(platform);
				platform.body.setAllowGravity(false);
				platform.body.setImmovable(true);
			}
		})
	this.physics.add.collider(this.platformGroup, this.enemy1Controller.enemyGroup);
}

	// handle collision between character and platform
	handePlatformCollision(character, platform) {
		var distObj = {};
		distObj.bottom = ((character.y + character.height/2) - (platform.y - platform.height/2));
		distObj.left = ((character.x + character.width/2) - (platform.x - platform.width/2))-30;
		distObj.right = ((character.x - character.width/2) - (platform.x + platform.width/2))+30;
		distObj.top = ((character.y - character.height/2) - (platform.y + platform.height/2));
		var lowest = 'bottom';
		for (var key in distObj) {
			var dist = distObj[key];
			if (Math.abs(distObj[lowest]) > Math.abs(dist)) {
				lowest = key;
			}
		}
		this.char.c[lowest] = true;
	}


	randomPlatformSpawner() {
		if (this.char.movement.pos.x - this.prevGameObjX > this.nextPlatformX) {
			this.nextPlatformX = Phaser.Math.Between(500, 1000);
			this.prevGameObjX = this.char.movement.pos.x;
			var spawnX = this.char.self.x + this.game.config.width;
			var spawnY = Math.max(this.char.self.y - 50, -10);
			var platform = this.add.rectangle(spawnX, spawnY, 500, 50, 0xfffff, 1);
			this.platformGroup.add(platform);
		}
	}

	groundHandler(first) {
		if (this.char.movement.pos.x - this.prevGround >= this.nextHole/2 + this.holeWidth/2) {
			// update gap distance and previous ground position
			this.prevGround += this.nextHole/2 + this.holeWidth/2;

			// spawn new platform and hole
			this.nextHole = !first ? Phaser.Math.Between(200, 2000) : 1000;
			this.holeWidth = Phaser.Math.Between(40, 200);
			var x = this.prevGround + this.nextHole/2;
			if (first) {
				this.holeWidth = 200;
				this.prevGround = -(this.char.movement.pos.x - this.holeWidth/4);
			}
			var platform = this.add.rectangle(x, 680, this.nextHole, 250, 0xfffff, 0);
			var hole = this.add.sprite(x + this.nextHole/2 + this.holeWidth/2, 680, 'hole');
			hole.displayWidth =this.holeWidth + 5;
			hole.displayHeight = 250;
			hole.name = 'hole';
			this.gameObjectsGroup.add(hole);
			this.platformGroup.add(platform);
		}
	}

}



