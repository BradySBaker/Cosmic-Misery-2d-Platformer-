import Phaser from "phaser";
import CharacterController from "./spriteControllers/characterController";
import enemy1Controller from "./spriteControllers/enemy1Controller";

export default class Game extends Phaser.Scene {
	preload() {
		this.load.image('sky', '..//assets/sky2.png');
		this.load.image('ground', '..//assets/ground2.png');
		this.load.image('mountains1', '..//assets/mountains1.png');
		this.load.image('mountains2', '..//assets/mountains2.png');
		this.load.atlas('player', '..//assets/player/player.png', '..//assets/player/player.json', true);
		this.load.image('playerArm', '..//assets/player/lArm.png');
		this.load.image('playerForearm', '..//assets/player/lForearm.png');
	}

	create() {
		this.input.addPointer(2);

		this.death = false;
		this.char = new CharacterController(this);

		this.enemy1Controller = new enemy1Controller(this);

		//Keybinds
		this.char.moveRObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.char.moveLObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.char.jumpObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		this.backgrounds = [];
		this.createBackgrounds();

		this.physics.world.setBoundsCollision(false, false, false, true);
		this.gameWidth = window.innerWidth
    this.gameHeight = 400;
		const graphics = this.add.graphics();

		if (/Mobi/.test(navigator.userAgent)) {
			this.mobile = true;
			this.setupJoystick();
		}

		this.char.createMainCharacter();
		this.enemy1Controller.createEnemy();

		this.physics.world.setBounds(-375, 0, this.innerWidth, this.gameHeight);

		this.gameObjectsGroup = this.add.group();
		var gameObjectsGroup = this.gameObjectsGroup;
		this.projectileGroup = this.physics.add.group({
			defaultKey: 'projectile', // or whatever the key of your circle sprite is
			maxSize: 50,
			createCallback: function (projectile) {
					// configure physics properties of the circle
					projectile.body.setBounce(1);
					gameObjectsGroup.add(projectile);
			}
	});

	this.enemyTimer = 1000;

	this.setupPlatforms(gameObjectsGroup);
	this.prevGameObjX = 100;
	this.nextPlatformX = 100;
	this.nextHole = 1000;
	this.holeWidth = 200;
	this.prevGround = -(this.nextHole - this.holeWidth);
	this.groundHandler(true);

	this.physics.add.collider(this.platformGroup, this.projectileGroup);
	this.physics.add.overlap(this.char.character, this.enemy1Controller.enemyGroup, () => {
		this.gameOver();
		this.death = true;
	});
	this.physics.add.overlap(this.projectileGroup, this.enemy1Controller.enemyGroup, (circle, enemy) => {
    enemy.destroy();
	});


this.cameras.main.startFollow(this.char.character, true, 0.5, 0.5, 0, 200);
this.cameras.main.setZoom(0.7);
// this.enemySpawner();

if (this.physics.world.isPaused) {
	this.physics.resume();
}
}

	update() {
		if (this.death) {
			return;
		}
		this.handleObjectPositioning();
		this.char.handleMainCharacter();
		this.handleBackgrounds();
		this.randomPlatformSpawner();
		this.groundHandler();
	}



	createProjectile() { // ------------ Projectile
		var radAng = this.char.forearm.angle*Math.PI/180;
		var x = this.char.forearm.x + 40*Math.cos(radAng) - 1*Math.sin(radAng);
		var y = this.char.forearm.y + 40*Math.sin(radAng) + 1*Math.cos(radAng);
		var curCircle;
		curCircle = this.add.circle(x, y, 5, 0xffffff, 1);
		this.projectileGroup.add(curCircle);
		var velocity = 1000;
		curCircle.name = 'projectile';
		curCircle.body.setVelocity(Math.cos(radAng) * velocity, Math.sin(radAng) * velocity);
		setTimeout(() => curCircle.destroy(), 10000);
	}

	enemySpawner() {
		if (!this.death) {
			this.enemy1Controller.spawnEnemy();
		}
		setTimeout(() => {this.enemySpawner()}, this.enemyTimer);
	}


	createBackgrounds() {
		this.add.image(-window.innerWidth/4, -800, 'sky')
		.setOrigin(0, 0)
		.setScrollFactor(0, .5)
		.setScale(1.3);

		this.backgrounds.push({
			ratioX: 0.1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 450, 'mountains2')
			.setOrigin(0,0)
			.setScrollFactor(0, .7)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 0.4,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 450, 'mountains1')
			.setOrigin(0,0)
			.setScrollFactor(0, 1)
			.setScale(1.4)
		})
		this.backgrounds.push({
			ratioX: 1,
			sprite: this.add.tileSprite(-window.innerWidth/2, 0, window.innerWidth*1.4, 600, 'ground')
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
			if (gameObject.name === 'enemy' && (this.char.onGround || this.char.cBottom) ) {
				if (gameObject.x < this.char.character.x && gameObject.body) {
					gameObject.body.setVelocityX(100);
				} else if(gameObject.body){
					gameObject.body.setVelocityX(-100);
				}
			}
				gameObject.x -= this.char.movement.dx;
		});
	}


	gameOver() {
		if (!this.death) {
			this.physics.world.timeScale = 2
			this.char.arm.visible = false;
			this.char.forearm.visible = false;
			this.char.character.play('death');

			setTimeout(() => createMenu(this), 2000);

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
			x: 200,
			y: this.gameHeight + 50,
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
				gameObjectsGroup.add(platform);
				platform.body.setAllowGravity(false);
				platform.body.setImmovable(true);
			}
		})
	this.physics.add.collider(this.platformGroup, this.enemy1Controller.enemyGroup);

	this.physics.add.collider(this.char.character, this.platformGroup, onCollision, null, this);

	// handle collision between character and platform
	function onCollision(character, platform) {
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

}


	randomPlatformSpawner() {
		if (this.char.movement.pos.x - this.prevGameObjX > this.nextPlatformX) {
			this.nextPlatformX = Phaser.Math.Between(300, 500);
			this.prevGameObjX = this.char.movement.pos.x;
			var platform = this.add.rectangle(400, Phaser.Math.Between(300, 400), 100, 20, 0xfffff, 1);
			this.platformGroup.add(platform);
		}
	}

	groundHandler(first) {
		if (this.char.movement.pos.x - this.prevGround >= this.nextHole/2 + this.holeWidth/2) {
			// update gap distance and previous ground position
			this.prevGround += this.nextHole/2 + this.holeWidth/2;

			// spawn new platform and hole
			this.nextHole = Phaser.Math.Between(200, 2000);
			this.holeWidth = Phaser.Math.Between(40, 200);
			var x = this.prevGround + this.nextHole/2;
			if (first) {
				this.holeWidth = 200;
				this.prevGround = -(this.char.movement.pos.x - this.holeWidth/4);
			}
			var platform = this.add.rectangle(x, 590, this.nextHole, 58, 0xfffff, 0);
			var hole = this.add.rectangle(x + this.nextHole/2 + this.holeWidth/2, 590, this.holeWidth + 5, 58, 0xffffff, 1);

			this.gameObjectsGroup.add(hole);
			this.platformGroup.add(platform);
		}
	}

}



var createMenu = (game) => {
	const menu = document.createElement("div");

	const deathMessage = document.createElement("p1");
	deathMessage.innerHTML = 'You Died';

	const button = document.createElement("button")
	menu.append(deathMessage, button);
	menu.id = "death";
	button.innerHTML = "START";

	document.body.appendChild(menu);
	button.addEventListener("click", () => restart(menu, game));
}

var restart = (e, game) => {
	e.remove();
	game.scene.restart();
}