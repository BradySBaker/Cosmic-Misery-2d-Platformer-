export default class characterController {
  constructor(scene) {
    this.scene = scene;
  }


	createMainCharacter() { // ------- Creating main self [c is collision]
		this.c = {left: false, right: false, bottom: false, top: false}
		this.movement = {dx: 0, g: .9, dy: 0, dir: 'right', pos: {x: 100, y: 400}}
		this.prevGrounded = 0;
		this.prevJump = 0;

		this.lastShot = 100;


		this.curAnim = '';
		this.self = this.scene.physics.add.sprite(this.movement.pos.x, this.movement.pos.y, 'player');
		this.self.setBodySize(50, 150);
		this.createArm();
		this.createAnimations();
		this.self.setDepth(1);
		this.self.body.setCollideWorldBounds(false);
		this.self.body.setAllowGravity(false);

		this.self.setOrigin(1, 1);

		this.speed = 10;

    this.shootTimer = 0;
	}


 handleMainCharacter() { // ------ Main self movement/events      =====[Function]========
		this.prevGrounded = this.c.bottom ? this.scene.time.now : this.prevGrounded;
		if (this.jumpObj.isDown === true || !this.c.bottom || this.hole) { //Jump pressed/inAir
			this.handleJump();
		}

		var moved = false;
		if (this.shootTimer > 0) {
			this.shootTimer -= 1 * this.scene.deltaTime;
		}
		if (this.moveRObj.isDown || this.moveLObj.isDown) {
			this.movement.dx = this.speed;
			if (!this.c.bottom) {
				this.movement.dx = this.speed + 3;
			} else {
				if (this.curAnim !== 'run') {
					this.curAnim = 'run';
					this.self.play('run');
				}
			}
			if (this.moveRObj.isDown) { //Right Press
				if (this.c.bottom) {
					this.self.setOffset(43, -5);
				}
				this.movement.dir = 'right';
				this.self.flipX = false;
			} else if (this.moveLObj.isDown) { //Left Press
				if (this.c.bottom) {
					this.self.setOffset(31, -5);
				}
				this.movement.dir = 'left';
				this.self.flipX = true;
			}
		} else { //No move
			if (this.curAnim !== 'idle' && this.c.bottom) { //Set idle settings
				this.self.play('idle');
				this.self.setOffset(-5,-4);
				this.curAnim = 'idle';
			}
			this.movement.dx = 0;
		}

		this.setPos();
	}

	shootProjectile() {
		this.shootTimer = 30;
		this.scene.projectileController.createProjectile();
	}

  handleJump() { // ------ Main self jump          ========[Function]========
		if (this.curAnim !== 'fall') {
			this.curAnim = 'fall';
			this.self.play('fall')
			this.self.anims.pause();
		}
		this.self.setOffset(24, 0 );
		this.arm.x = this.self.x - 3;

		var timeNow = this.scene.time.now
		var timeSinceGround = timeNow - this.prevGrounded;
		var timeSinceJump = timeNow - this.prevJump;

		var checkBottom = (this.c.bottom && timeSinceJump > 500) ||  (timeSinceGround < 200 && timeSinceJump > 500);
		if ((this.jumpObj.isDown) && checkBottom) {
			this.prevJump = this.scene.time.now;
			this.self.play('fall')
			this.self.anims.pause();
			this.movement.dy = -20;
			this.c.bottom = false;
		} else if (!this.c.bottom) {
			if (this.movement.dy < -1 ) { //Going up
				this.movement.dy *= Math.pow(this.movement.g, this.scene.deltaTime);
			} else { //Going down
				if (this.movement.dy === 0) {
					this.movement.dy = 1;
				}
				if (this.self.anims.currentFrame.index === 1) {
					this.self.anims.nextFrame();
				}
				if (this.movement.dy >= -25) {
					this.movement.dy = Math.abs(this.movement.dy /= Math.pow(this.movement.g, this.scene.deltaTime));
				}
			}
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

	setPos() { // ------- Char pos                 =======[Function]=======
		this.movement.dx = this.movement.dir === 'right' ? this.movement.dx : -this.movement.dx ;
		if (this.c.left && this.movement.dir === 'right') {
			// this.movement.dx = -this.speed;
			this.c.left = false;
			if (this.jumpObj.isDown) {
				this.movement.dy = -20;
			}
			this.movement.dx = 0;
		} else if (this.c.right && this.movement.dir === 'left') {
			// this.movement.dx = this.speed;
			this.c.right = false;
			if (this.jumpObj.isDown) {
				this.movement.dy = -20;
			}
			this.movement.dx = 0;
		} else if (this.c.bottom){
			if (this.movement.dy > 0 ){
				this.movement.dy = 0;
			}
		} else if (this.c.top) {
			this.movement.dy = 1;
		}

		this.movement.pos.x += this.movement.dx * this.scene.deltaTime;

		this.movement.pos.y += this.movement.dy * this.scene.deltaTime;

		this.self.y = this.movement.pos.y;

		this.arm.y = this.movement.pos.y - 38;
		this.handleArmPos();
		this.handleArmAngle();
	}

	handleArmPos(string) {
		var curFrame = this.self.anims.currentFrame;
		var idleOffset = 3;
		var runOffset = {x: 8, y: 2};
		if (curFrame) {
			if (this.movement.dir === 'right') {
				if (this.curAnim === 'idle') {
					this.arm.x =  this.self.x + this.idleArmPos[curFrame.index-1] + idleOffset;
				} else if (this.curAnim === 'run') {
					this.arm.x =  this.self.x + this.runArmPos.x[curFrame.index-1] - runOffset.x;
					this.arm.y = this.self.y + this.runArmPos.y[curFrame.index-1] + runOffset.y;
				}
			} else { // self is facing left
				if (this.curAnim === 'idle') {
					this.arm.x =  this.self.x - this.idleArmPos[curFrame.index-1] - idleOffset;
				} else if(this.curAnim === 'run') {
					this.arm.x = this.self.x - this.runArmPos.x[curFrame.index-1] + runOffset.x;
					this.arm.y = this.self.y + this.runArmPos.y[curFrame.index-1] + runOffset.y;
				}
			}
		}
	}



	handleArmAngle() {//Sets arm angle based on mouse									========[Function]===========
		var mouseWorldX = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).x;
		var mouseWorldY = this.scene.cameras.main.getWorldPoint(this.scene.input.x, this.scene.input.y).y;
		this.crosshair.x = mouseWorldX;
		this.crosshair.y = mouseWorldY;
		if (this.scene.mobile) {
			var pointer = this.getNonJoyStickMobilePointer();
			mouseWorldX = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).x;
			mouseWorldY = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y).y;
			this.mobilePointerTimer += 1 * this.scene.deltaTime;
		}

		var targetArmRad = Phaser.Math.Angle.Between(
			this.arm.x, this.arm.y,
			mouseWorldX, mouseWorldY
		)
		const targetForearmRad = Phaser.Math.Angle.Between(
			this.forearm.x, this.forearm.y,
			mouseWorldX, mouseWorldY
		)

		var armRadAngle = this.arm.angle*Math.PI/180;
		var forearmRadAngle = this.forearm.angle*Math.PI/180;
		if (targetArmRad < -Math.PI/2 && armRadAngle > 0) {
			targetArmRad += Math.PI*2;
		} else if (targetArmRad > Math.PI/2 && armRadAngle < 0) {
				targetArmRad -= Math.PI*2;
		}
		var mouseArmAngle;
		if (armRadAngle < targetArmRad && this.movement.dir === 'right' || armRadAngle > targetArmRad && this.movement.dir === 'left' ) { //If arm going down
			mouseArmAngle = Phaser.Math.RadToDeg(targetArmRad);
		} else { //If arm going up
			const interpolatedArmRad = Phaser.Math.Interpolation.Bezier([armRadAngle, targetArmRad], .07);
			mouseArmAngle = Phaser.Math.RadToDeg(interpolatedArmRad);
		}

		var mouseForearmAngle = Phaser.Math.RadToDeg(targetForearmRad);
		console.log(this.arm.angle);
		if (this.lastShot <= 10) {
			var offset = 10;
			if (this.movement.dir === "right") {
				offset = -10;
			}
			this.arm.angle += offset/this.lastShot;
			this.forearm.angle = this.arm.angle + offset*15/this.lastShot;
		} else if (this.lastShot <= 15) {
			var offset = 7;
			if (this.movement.dir === "right") {
				offset = -7;
			}
			this.arm.angle -= offset;
			this.forearm.angle = this.arm.angle  + offset*15/this.lastShot;;
		} else {
			this.arm.angle = mouseArmAngle;
			this.forearm.angle = mouseForearmAngle;
		}

		var yPosOffset = -1;

		if (this.movement.dir === 'right') {
			this.arm.setScale(.2,.2);
			this.forearm.setScale(.2,.2);
			this.gun.setScale(-.5, .5);
		} else {
			var yPosOffset = 2;
			this.arm.setScale(.2,-.2);
			this.forearm.setScale(.2,-.2);
			this.gun.setScale(-.5, -.5);
		}
		var x = this.arm.x + 25*Math.cos(armRadAngle) - yPosOffset*Math.sin(armRadAngle);
		var y = this.arm.y + 25*Math.sin(armRadAngle) + yPosOffset*Math.cos(armRadAngle);
		this.forearm.x = x;
		this.forearm.y = y;

		var x = this.forearm.x + 25*Math.cos(forearmRadAngle) - yPosOffset*Math.sin(forearmRadAngle);
		var y = this.forearm.y + 25*Math.sin(forearmRadAngle) + yPosOffset*Math.cos(forearmRadAngle);
		this.gun.x = x;
		this.gun.y = y;
		this.gun.angle = this.forearm.angle;

		this.lastShot += 1 * this.scene.deltaTime;

		if (this.scene.input.activePointer.isDown && this.shootTimer <= 0) { //Handles shooting after arm updated
			if (this.scene.mobile) {
				var pointer = this.getNonJoyStickMobilePointer();
				if (pointer.isDown) {
					this.lastShot = 1;
					this.shootProjectile();
				}
			} else { //Not mobile
				this.lastShot = 1;
				this.shootProjectile()
				this.justShot = true;
			}
		}

	}

















	createArm() { // -- Sets up arm                     ======[Function]==============
		this.runArmPos = {x: [15, 15, 13, 12, 13, 14, 14, 16, 18, 16, 13, 11, 11, 12, 13, 14], y: [-30, -28, -28, -30, -33, -37, -38, -39, -37, -37, -38, -41, -43, -41, -40, -36]};
		this.idleArmPos = [-22, -21, -20, -19, -16, -12, -8, -5, -3, -1, -1, -3, -5, -8, -9, -12, -14, -16, -18, -20];
		this.arm = this.scene.add.image(this.self.x, this.movement.pos.y - 35, 'playerArm')
		.setOrigin(0, .5)
		.setScale(.2)
		.setDepth(1);
		this.forearm = this.scene.add.image(this.arm.x, this.arm.y, 'playerForearm')
		.setOrigin(0,0)
		.setScale(.2)
		.setDepth(1);
		this.gun = this.scene.add.image(this.arm.x, this.arm.y, 'python')
		.setDepth(1)
		.setScale(-.5, .5);
		var crosshairSize = 4;
		if (this.scene.mobile) {
			crosshairSize = 20;
		}
		this.crosshair = this.scene.add.circle(0, 0, crosshairSize, 0xffffff, .5);
	}




	createAnimations() { // ---- Creates all animations                  ======[Function]========
		this.self.anims.create({
			key: 'death',
			frames: this.self.anims.generateFrameNames('player', {
					prefix: 'death/death_',
					start: 0,
					end: 26,
					zeroPad: 2,
					suffix: '.png'
			}),
			frameRate: 20,
			repeat: 0
	});


		this.self.anims.create({
			key: 'idle',
			frames: this.self.anims.generateFrameNames('player', {
					prefix: 'idle/idle_',
					start: 0,
					end: 19,
					zeroPad: 2,
					suffix: '.png'
			}),
			frameRate: 20,
			repeat: -1
	});

	this.self.anims.create({
		key: 'walk',
		frames: this.self.anims.generateFrameNames('player', {
				prefix: 'walk/walk_',
				start: 0,
				end: 21,
				zeroPad: 2,
				suffix: '.png'
		}),
		frameRate: 20,
		repeat: -1
});

	this.self.anims.create({
		key: 'fall',
		frames: this.self.anims.generateFrameNames('player', {
				prefix: 'inAir/player-InAir_',
				start: 0,
				end: 1,
				zeroPad: 1,
				suffix: '.png'
		}),
		frameRate: 20,
		repeat: -1
	});

	this.self.anims.create({
		key: 'run',
		frames: this.self.anims.generateFrameNames('player', {
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