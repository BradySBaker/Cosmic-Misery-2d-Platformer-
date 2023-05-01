import Phaser from "phaser";
import CharacterController from "./spriteControllers/characterController";

export default class Game extends Phaser.Scene {
	preload() {
		this.load.image('sky', '..//assets/sky.png');
		this.load.image('ground', '..//assets/ground.png');
		this.load.image('mountains1', '..//assets/mountains1.png');
		this.load.image('mountains2', '..//assets/mountains2.png');
		this.load.atlas('player', '..//assets/player/player.png', '..//assets/player/player.json', true);
		this.load.image('playerArm', '..//assets/player/lArm.png');
		this.load.image('playerForearm', '..//assets/player/lForearm.png');
	}

	create() {
		this.death = false;

		this.backgrounds = [];

		this.char = new CharacterController(this);
		this.add.image(0, -600, 'sky')
		.setOrigin(0, 0)
		.setScrollFactor(0, .5);

		this.backgrounds.push({
			ratioX: 0.1,
			sprite: this.add.tileSprite(0, 0, 945, 450, 'mountains2')
			.setOrigin(0,0)
			.setScrollFactor(0, .7)
		})
		this.backgrounds.push({
			ratioX: 0.4,
			sprite: this.add.tileSprite(0, 0, 945, 450, 'mountains1')
			.setOrigin(0,0)
			.setScrollFactor(0, 1)
		})
		this.backgrounds.push({
			ratioX: 1,
			sprite: this.add.tileSprite(0, 0, 945, 450, 'ground')
			.setOrigin(0,0)
			.setScrollFactor(0, 1)
		})
		this.physics.world.setBoundsCollision(false, false, false, true);

		this.char.moveRObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
		this.char.moveLObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.char.jumpObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

		this.gameWidth = this.sys.game.canvas.width
    this.gameHeight = 400;

		const graphics = this.add.graphics();

		this.char.createMainCharacter();

		this.physics.world.setBounds(-375, 0, 945, this.gameHeight);

		this.gameObjectsGroup = this.add.group();
		this.projectileGroup = this.physics.add.group({
			defaultKey: 'projectile', // or whatever the key of your circle sprite is
			maxSize: 50,
			createCallback: function (projectile) {
					// configure physics properties of the circle
					projectile.body.setCollideWorldBounds(true, .5, .5);
			}
	});

	this.enemyGroup = this.physics.add.group({
		defaultKey: 'enemy',
		maxSize: 50,
		createCallback: function (enemy) {
			enemy.body.setCollideWorldBounds(true, 1, 1);
		}
	});
	this.enemyTimer = 1000;


	this.physics.add.overlap(this.char.character, this.enemyGroup, () => {
		this.gameOver();
		this.death = true;
	});
	this.physics.add.overlap(this.projectileGroup, this.enemyGroup, (circle, enemy) => {
    enemy.destroy();
	});


this.cameras.main.startFollow(this.char.character, true, 0.5, 0.5, 0, 0);
this.enemySpawner();

if (this.physics.world.isPaused) {
	this.physics.resume();
}
}

	update() {
		if (this.death) {
			return;
		}

		this.gameObjectsGroup.children.iterate((gameObject) => {
			if (gameObject.name === 'enemy' && this.char.onGround) {
				if (gameObject.x < this.char.character.x && gameObject.body) {
					gameObject.body.setVelocityX(100);
				} else if(gameObject.body){
					gameObject.body.setVelocityX(-100);
				}
			}
			if (gameObject.name === 'projectile') {
				gameObject.body.setVelocityX(gameObject.body.velocity.x - this.char.movement.dx);
			} else {
				gameObject.x -= this.char.movement.dx;
			}
		});
		this.char.handleMainCharacter();
		this.handleBackgrounds();
	}



	createEnemy() { // -----------------  Enemy
		var curEnemy = this.add.rectangle(500, 350, 20, 50, 0xffffff, 1);
		curEnemy.name = 'enemy';
		this.enemyGroup.add(curEnemy);
		this.gameObjectsGroup.add(curEnemy);
	}

	createProjectile() { // ------------ Projectile
		var radAng = this.char.forearm.angle*Math.PI/180;
		var x = this.char.forearm.x + 40*Math.cos(radAng) - 1*Math.sin(radAng);
		var y = this.char.forearm.y + 40*Math.sin(radAng) + 1*Math.cos(radAng);
		var curCircle;
		curCircle = this.add.circle(x, y, 5, 0xffffff, 1);
		this.projectileGroup.add(curCircle);
		this.gameObjectsGroup.add(curCircle);

		var velocity = 1000;
		curCircle.name = 'projectile';
		curCircle.body.setVelocity(Math.cos(radAng) * velocity, Math.sin(radAng) * velocity);
		setTimeout(() => curCircle.destroy(), 1000);
	}

	enemySpawner() {
		if (!this.death) {
			this.createEnemy();
		}
		setTimeout(() => {this.enemySpawner()}, this.enemyTimer);
	}


	handleBackgrounds() {
		for (let i =0 ; i< this.backgrounds.length; i++) {
			const bg = this.backgrounds[i];

			bg.sprite.tilePositionX = this.char.movement.pos.x * bg.ratioX;
		}
	}


	gameOver() {
		if (!this.death) {
			const menu = document.createElement("div");

			const deathMessage = document.createElement("p1");
			deathMessage.innerHTML = 'You Died';

			const button = document.createElement("button")
			menu.append(deathMessage, button);
			menu.id = "death";
			button.innerHTML = "START";

			document.body.appendChild(menu);
			const game = this;
			button.addEventListener("click", () => restart(menu, game));

			this.physics.world.timeScale = 2
			this.char.arm.visible = false;
			this.char.forearm.visible = false;
			this.char.character.play('death');
		}
	}
}

var restart = (e, game) => {
	e.remove();
	game.scene.restart();
}