export default class characterController {
  constructor(scene) {
    this.scene = scene;
  }

	createMainCharacter() { // ------- Creating main acter
		this.onGround = true;
		this.dx = 0;
		this.g = .95;
		this.dy = 0;
		this.dir = 'right';
		this.pos = {x: 100, y: this.scene.gameHeight - 70}

		this.curAnim = '';

		this.character = this.scene.physics.add.sprite(this.pos.x, this.pos.y, 'player');
		this.character.setBodySize(50, 150);
		this.createAnimations();

		this.character.body.setCollideWorldBounds(false);
		this.character.body.setAllowGravity(false);

		this.character.setOrigin(1, 1);
		this.gun = this.scene.add.rectangle(this.character.x, this.pos.y - 60, 40, 5, 0xffffff, 1);
		this.gun.setOrigin(0, 0);
    this.shootTimer = 0;
	}

  handleMainCharacter() { // ------ Main character movement/events
		const mouseWorldX = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).x;
		const mouseWorldY = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).y;

		const targetGunRad = Phaser.Math.Angle.Between(
			this.gun.x, this.gun.y,
			mouseWorldX, mouseWorldY
		)

		this.mouseGunAngle = Phaser.Math.RadToDeg(targetGunRad);
		this.gun.angle = this.mouseGunAngle;

		if (this.jumpObj.isDown === true || !this.onGround) { //Jump pressed/inAir
			this.handleMainCharacterJump();
		}
		if (!this.onGround) {
			if (this.dir === 'left') {
				this.character.setOffset(10,10);
				this.gun.x = this.character.x + 10;
			} else {
				this.character.setOffset(0,10);
				this.gun.x = this.character.x - 10;
			}
		}

		var moved = false;
		if (this.shootTimer > 0) {
			this.shootTimer--;
		}
		if (this.moveRObj.isDown) { //D key
			this.dir = 'right';
			this.character.flipX = false;
			if (!this.onGround) {
				this.dx = 7;
			} else { //On ground right move
				this.character.setOffset(43, -5);
				this.gun.x = this.character.x + 10;
				if (this.curAnim !== 'run') {
					this.curAnim = 'run';
					this.character.play('run');
				}
				this.dx = 5;
			}
		} else if (this.moveLObj.isDown) { //A key
			this.dir = 'left';
			this.character.flipX = true;
			if (!this.onGround) {
				this.dx = -7;
			} else { //On ground left move
				this.character.setOffset(31, -5);
				this.gun.x = this.character.x - 10;
				if (this.curAnim !== 'run') {
					this.curAnim = 'run';
					this.character.play('run');

				}
				this.dx = -5;
			}
		} else { //No move
			if (this.curAnim !== 'idle' && this.onGround) { //Set idle settings
				this.character.play('idle');
				this.character.setOffset(-5,-4);
				this.curAnim = 'idle';
				if (this.dir === 'right') {
					this.gun.x = this.character.x -3;
				} else {
					this.gun.x = this.character.x + 3;
				}
			} else if (this.onGround){ //Anim idle setup
				var curFrame = this.character.anims.currentFrame;
				if (curFrame) {
					if (this.dir === 'right') {
						if (curFrame.index > 10 && this.gun.x > this.character.x - 10) {
							this.gun.x -= .3;
						} else if (this.gun.x < this.character.x + 15 && curFrame.index > 2) {
							this.gun.x += .3;
						}
					} else { // character is facing left
						if (curFrame.index > 10 && this.gun.x < this.character.x + 10) {
							this.gun.x += .3;
						} else if (this.gun.x > this.character.x - 15 && curFrame.index > 2) {
							this.gun.x -= .3;
						}
					}
				}
			}
			this.dx = 0;
		}
		this.pos.y += this.dy;
		this.pos.x += this.dx;
		if (this.scene.input.activePointer.isDown && this.shootTimer === 0) {
			this.shootTimer = 20;
			this.scene.createProjectile();
		}

		this.setMainCharacterPos();
	}

  handleMainCharacterJump() { // ------ Main character jump
		if (this.jumpObj.isDown && this.pos.y === this.scene.gameHeight - 70) {
			this.dy = -20;
			this.onGround = false;
			this.curAnim = 'fall';
			this.character.play('fall')
		} else if (this.pos.y + this.dy <= this.scene.gameHeight - 70) {
			if (this.dy < -1 ) {
				this.dy *= this.g;
			} else {
				this.dy = Math.abs(this.dy /= this.g);
			}
		} else {
			this.onGround = true;
			this.dy = 0;
			this.pos.y = this.scene.gameHeight - 70;
		}
	}


	setMainCharacterPos() { // ------- Char pos
		this.character.y = this.pos.y;
		this.gun.y = this.pos.y - 30;
	}

	createAnimations() {
		this.character.anims.create({
			key: 'death',
			frames: this.character.anims.generateFrameNames('player', {
					prefix: 'death/death_',
					start: 0,
					end: 26,
					zeroPad: 2,
					suffix: '.png'
			}),
			frameRate: 20,
			repeat: -1
	});

		this.character.anims.create({
			key: 'idle',
			frames: this.character.anims.generateFrameNames('player', {
					prefix: 'idle/idle_',
					start: 0,
					end: 19,
					zeroPad: 2,
					suffix: '.png'
			}),
			frameRate: 20,
			repeat: -1
	});

	this.character.anims.create({
		key: 'walk',
		frames: this.character.anims.generateFrameNames('player', {
				prefix: 'walk/walk_',
				start: 0,
				end: 21,
				zeroPad: 2,
				suffix: '.png'
		}),
		frameRate: 20,
		repeat: -1
});

	this.character.anims.create({
		key: 'run',
		frames: this.character.anims.generateFrameNames('player', {
				prefix: 'run/run_',
				start: 0,
				end: 15,
				zeroPad: 2,
				suffix: '.png'
		}),
		frameRate: 20,
		repeat: -1
	});

	this.character.anims.create({
		key: 'fall',
		frames: this.character.anims.generateFrameNames('player', {
				prefix: 'inAir/inAir_',
				start: 0,
				end: 13,
				zeroPad: 2,
				suffix: '.png'
		}),
		frameRate: 20,
		repeat: -1
	});
	}

}