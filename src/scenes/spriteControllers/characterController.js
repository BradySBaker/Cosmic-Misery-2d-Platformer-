export default class characterController {
  constructor(scene) {
    this.scene = scene;
  }


	createMainCharacter() { // ------- Creating main character
		this.onGround = false;
		this.c = {left: false, right: false, bottom: false, top: false}
		this.movement = {dx: 0, g: .9, dy: 0, dir: 'right', pos: {x: 100, y: this.scene.gameHeight - 200}}

		this.curAnim = '';
		this.character = this.scene.physics.add.sprite(this.movement.pos.x, this.movement.pos.y, 'player');
		this.character.setBodySize(50, 150);
		this.createArm();
		this.createAnimations();
		this.character.setDepth(1);
		this.character.body.setCollideWorldBounds(false);
		this.character.body.setAllowGravity(false);

		this.character.setOrigin(1, 1);


    this.shootTimer = 0;
		this.jumpTimer = 0;
	}


  handleMainCharacter() { // ------ Main character movement/events      =====[Function]========
		this.onGround = this.c.bottom;
		if (this.jumpObj.isDown === true || !this.onGround || this.hole) { //Jump pressed/inAir
			this.handleCharacterJump();
		}

		var moved = false;
		if (this.shootTimer > 0) {
			this.shootTimer--;
		}
		if (this.moveRObj.isDown || this.moveLObj.isDown) {
			this.movement.dx = 5;
			if (!this.onGround) {
				this.movement.dx = 7;
			} else {
				if (this.curAnim !== 'run') {
					this.curAnim = 'run';
					this.character.play('run');
				}
			}
			if (this.moveRObj.isDown) { //Right Press
				if (this.onGround) {
					this.character.setOffset(43, -5);
				}
				this.movement.dir = 'right';
				this.character.flipX = false;
			} else if (this.moveLObj.isDown) { //Left Press
				if (this.onGround) {
					this.character.setOffset(31, -5);
				}
				this.movement.dir = 'left';
				this.character.flipX = true;
			}
		} else { //No move
			if (this.curAnim !== 'idle' && this.onGround) { //Set idle settings
				this.character.play('idle');
				this.character.setOffset(-5,-4);
				this.curAnim = 'idle';
			}
			this.movement.dx = 0;
		}
		if (this.scene.input.activePointer.isDown && this.shootTimer === 0) {
			if (this.scene.mobile) {
				var pointer = this.getNonJoyStickMobilePointer();
				if (pointer.isDown) {
					this.shootProjectile();
				}
			} else { //Not mobile
				this.shootProjectile()
			}
		}

		this.setCharacterPos();
	}

	shootProjectile() {
		this.shootTimer = 20;
		this.scene.createProjectile();
	}

  handleCharacterJump() { // ------ Main character jump          ========[Function]========
		if (this.curAnim !== 'fall') {
			this.curAnim = 'fall';
			this.character.play('fall')
			this.character.anims.pause();
		}
		this.character.setOffset(24, 0 );
		this.arm.x = this.character.x - 3;
		if (this.jumpObj.isDown && this.onGround && this.jumpTimer < 0) {
			this.character.play('fall')
			this.character.anims.pause();
			this.cBottom = false;
			this.movement.dy = -20;
			this.onGround = false;
			this.jumpTimer = 10;
		} else if (!this.onGround) {
			this.jumpTimer--;
			if (this.movement.dy < -1 ) { //Going up
				this.movement.dy *= this.movement.g;
			} else { //Going down
				if (this.movement.dy === 0) {
					this.movement.dy = 1;
				}
				if (this.character.anims.currentFrame.index === 1) {
					this.character.anims.nextFrame();
				}
				this.movement.dy = Math.abs(this.movement.dy /= this.movement.g);
			}
		} else {
			this.onGround = true;
			this.movement.dy = 0;
			this.movement.pos.y = this.scene.gameHeight - 70;
		}
	}


	getNonJoyStickMobilePointer() { //Handles getting the pointer that is not the joystick pointer
		var pointer1 = this.scene.input.pointer1;
		var pointer2 = this.scene.input.pointer2;
		if (pointer1 === this.scene.joystick.pointer) {
			return pointer2;
		} else if (pointer2 === this.scene.joystick.pointer) {
			return pointer1;
		} else {
			return pointer1;
		}
	}

	setCharacterPos() { // ------- Char pos                 =======[Function]=======
		this.movement.dx = this.movement.dir === 'right' ? this.movement.dx : -this.movement.dx;
		if (this.c.left && this.movement.dir === 'right') {
			this.movement.dx = -5;
			this.c.left = false;
		} else if (this.c.right && this.movement.dir === 'left') {
			this.movement.dx = 5;
			this.c.right = false;
		} else if (this.c.bottom){
			if (this.movement.dy > 0 ){
				this.movement.dy = 0;
			}
			this.c.bottom = false;
			this.onGround = false;
		} else if (this.c.top) {
			if (this.movement.dy < 0) {
				this.movement.dy = 1;
			}
			this.c.top = false;
		}
		this.movement.pos.x += this.movement.dx;

		this.movement.pos.y += this.movement.dy;

		this.character.y = this.movement.pos.y;

		this.arm.y = this.movement.pos.y - 38;
		this.handleArmPos();
		this.handleArmAngle();
	}

	handleArmPos(string) {
		var curFrame = this.character.anims.currentFrame;
		var idleOffset = 3;
		var runOffset = {x: 8, y: 2};
		if (curFrame) {
			if (this.movement.dir === 'right') {
				if (this.curAnim === 'idle') {
					this.arm.x =  this.character.x + this.idleArmPos[curFrame.index-1] + idleOffset;
				} else if (this.curAnim === 'run') {
					this.arm.x =  this.character.x + this.runArmPos.x[curFrame.index-1] - runOffset.x;
					this.arm.y = this.character.y + this.runArmPos.y[curFrame.index-1] + runOffset.y;
				}
			} else { // character is facing left
				if (this.curAnim === 'idle') {
					this.arm.x =  this.character.x - this.idleArmPos[curFrame.index-1] - idleOffset;
				} else if(this.curAnim === 'run') {
					this.arm.x = this.character.x - this.runArmPos.x[curFrame.index-1] + runOffset.x;
					this.arm.y = this.character.y + this.runArmPos.y[curFrame.index-1] + runOffset.y;
				}
			}
		}
	}



	handleArmAngle() {//Sets arm angle based on mouse									========[Function]===========
		var mouseWorldX = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).x;
		var mouseWorldY = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).y;
		if (this.scene.mobile) {
			var pointer = this.getNonJoyStickMobilePointer();
			mouseWorldX = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
			mouseWorldY = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
		}

		var targetArmRad = Phaser.Math.Angle.Between(
			this.arm.x, this.arm.y,
			mouseWorldX, mouseWorldY
		)
		const targetForearmRad = Phaser.Math.Angle.Between(
			this.forearm.x, this.forearm.y,
			mouseWorldX, mouseWorldY
		)
		var radAng = this.arm.angle*Math.PI/180;
		if (targetArmRad < -Math.PI/2 && radAng > 0) {
			targetArmRad += Math.PI*2;
		} else if (targetArmRad > Math.PI/2 && radAng < 0) {
				targetArmRad -= Math.PI*2;
		}
		var mouseArmAngle;
		if ((radAng < targetArmRad && this.movement.dir === 'right') || radAng > targetArmRad && this.movement.dir === 'left' ) { //If arm going down
			mouseArmAngle = Phaser.Math.RadToDeg(targetArmRad);
		} else { //If arm going up
			const interpolatedArmRad = Phaser.Math.Interpolation.Bezier([radAng, targetArmRad], .07);
			mouseArmAngle = Phaser.Math.RadToDeg(interpolatedArmRad);
		}

		var mouseForearmAngle = Phaser.Math.RadToDeg(targetForearmRad);
		this.arm.angle = mouseArmAngle;
		this.forearm.angle = mouseForearmAngle
		var yPosOffset = -1;

		if (this.movement.dir === 'right') {
			this.arm.setScale(.2,.2);
			this.forearm.setScale(.2,.2);
		} else {
			var yPosOffset = 2;
			this.arm.setScale(.2,-.2);
			this.forearm.setScale(.2,-.2);
		}
		var x = this.arm.x + 25*Math.cos(radAng) - yPosOffset*Math.sin(radAng);
		var y = this.arm.y + 25*Math.sin(radAng) + yPosOffset*Math.cos(radAng);
		this.forearm.x = x;
		this.forearm.y = y;
	}

















	createArm() { // -- Sets up arm                     ======[Function]==============
		this.runArmPos = {x: [15, 15, 13, 12, 13, 14, 14, 16, 18, 16, 13, 11, 11, 12, 13, 14], y: [-30, -28, -28, -30, -33, -37, -38, -39, -37, -37, -38, -41, -43, -41, -40, -36]};
		this.idleArmPos = [-22, -21, -20, -19, -16, -12, -8, -5, -3, -1, -1, -3, -5, -8, -9, -12, -14, -16, -18, -20];
		this.arm = this.scene.add.image(this.character.x, this.movement.pos.y - 35, 'playerArm')
		this.forearm = this.scene.add.image(this.arm.x, this.arm.y, 'playerForearm');
		this.arm.setScale(.2);
		this.forearm.setScale(.2);
		this.forearm.setOrigin(0,0);
		this.arm.setOrigin(0, .5);
		this.arm.setDepth(1);
		this.forearm.setDepth(1);
	}




	createAnimations() { // ---- Creates all animations                  ======[Function]========
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
			repeat: 0
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
		key: 'fall',
		frames: this.character.anims.generateFrameNames('player', {
				prefix: 'inAir/player-InAir_',
				start: 0,
				end: 1,
				zeroPad: 1,
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
	}
}