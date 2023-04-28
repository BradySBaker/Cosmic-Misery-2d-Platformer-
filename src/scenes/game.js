import Phaser from "phaser";
import CharacterController from "./spriteControllers/characterController";

export default class Game extends Phaser.Scene {
	preload() {
		this.load.image('sky', '..//assets/sky.png');
		this.load.image('ground', '..//assets/ground.png');
		this.load.image('mountains1', '..//assets/mountains1.png');
		this.load.image('mountains2', '..//assets/mountains2.png');
	}

	create() {

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

		this.char.moveObj = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
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

	this.physics.add.overlap(this.projectileGroup, this.enemyGroup, (circle, enemy) => {
    enemy.destroy();
});
this.cameras.main.startFollow(this.char.body, true, 0.5, 0.5, 0, 0);
// this.enemySpawner();

if (this.physics.world.isPaused) {
	this.physics.resume();
}
}

	update() {
		this.gameObjectsGroup.children.iterate((gameObject) => {
			if (gameObject.name === 'enemy' && this.char.onGround) {
				if (gameObject.x < this.char.body.x) {
					gameObject.body.setVelocityX(100);
				} else {
					gameObject.body.setVelocityX(-100);
				}
			}
			if (gameObject.name === 'projectile') {
				gameObject.body.setVelocityX(gameObject.body.velocity.x - this.char.dx);
			} else {
				gameObject.x += this.char.dx;
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
		var radAng = this.char.gun.angle*Math.PI/180;
		var x = this.char.gun.x + 40*Math.cos(radAng) - 5*Math.sin(radAng);
		var y = this.char.gun.y + 40*Math.sin(radAng) + 5*Math.cos(radAng);
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

		this.createEnemy();
		setTimeout(() => {this.enemySpawner()}, this.enemyTimer);
	}


	handleBackgrounds() {
		for (let i =0 ; i< this.backgrounds.length; i++) {
			const bg = this.backgrounds[i];

			bg.sprite.tilePositionX = this.char.pos.x * bg.ratioX;
		}
	}
}