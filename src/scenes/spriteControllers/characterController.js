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
		this.pos = {x: 100, y: this.scene.gameHeight}
		this.body = this.scene.add.rectangle(this.pos.x, this.pos.y, 20, 80, 0xfff, 1);
		this.body.setOrigin(1, 1);
		this.gun = this.scene.add.rectangle(this.pos.x-8, this.pos.y - 60, 40, 5, 0xffffff, 1);
		this.gun.setOrigin(0, 0);
    this.shootTimer = 0;
	}

  handleMainCharacter() { // ------ Main character movement/events
		const mouseWorldX = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).x;
		const mouseWorldY = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).y;
		const targetBodyRad = Phaser.Math.Angle.Between(
			this.body.x, this.body.y,
			mouseWorldX, mouseWorldY
		);

		const mouseBodyAngle = Phaser.Math.RadToDeg(targetBodyRad);

		const targetGunRad = Phaser.Math.Angle.Between(
			this.gun.x, this.gun.y,
			mouseWorldX, mouseWorldY
		)

		this.mouseGunAngle = Phaser.Math.RadToDeg(targetGunRad);
		this.gun.angle = this.mouseGunAngle;

		if (this.jumpObj.isDown === true || !this.onGround) {
			this.handleMainCharacterJump();
		}


		var moved = false;
		if (this.shootTimer > 0) {
			this.shootTimer--;
		}
		if (mouseBodyAngle > -90 && mouseBodyAngle < 100) {
			this.dir = 'right';
		} else {
			this.dir = 'left';
		}

		if (this.moveObj.isDown) {
			if (this.dir === 'left' && this.pos.x > 5) {
				if (!this.onGround) {
					this.dx = -7;
				} else {
					this.dx = -5;
				}
			} else {
				if (!this.onGround) {
					this.dx = 7;
				} else {
					this.dx = 5;
				}
			}
		} else {
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
		if (this.jumpObj.isDown && this.pos.y === this.scene.gameHeight) {
			this.dy = -20;
			this.onGround = false;
		} else if (this.pos.y + this.dy <= this.scene.gameHeight) {
			if (this.dy < -1 ) {
				this.dy *= this.g;
			} else {
				this.dy = Math.abs(this.dy /= this.g);
			}
		} else {
			this.onGround = true;
			this.dy = 0;
			this.pos.y = this.scene.gameHeight;
		}
	}


	setMainCharacterPos() { // ------- Char pos
		this.body.y = this.pos.y;
		this.gun.y = this.pos.y - 60;
	}
}