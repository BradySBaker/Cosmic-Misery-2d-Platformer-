export default class projectileController {
  constructor(scene) {
    this.scene = scene;
		this.projectiles = [];
  }

	createProjectile() { // ------------ Projectile
		var radAng = this.scene.char.forearm.angle*Math.PI/180;
		var offset = 0;
		var x = this.scene.char.forearm.x + offset*Math.cos(radAng) - 1*Math.sin(radAng);
		var y = this.scene.char.forearm.y + offset*Math.sin(radAng) + 1*Math.cos(radAng);

		var projectile = this.scene.add.sprite(x, y, 'projectile');
		projectile.setScale(.1);

		var velocity = 100;
		projectile.name = 'projectile';
		projectile.velocity = {
			x: Math.cos(radAng) * velocity,
			y: Math.sin(radAng) * velocity
		}

		projectile.deathTimer = 30;
		projectile.originY = projectile.y;

		this.projectiles.push(projectile);
	}

	handleProjectiles() {
		this.projectiles.forEach((projectile, idx) => {
      projectile.x += projectile.velocity.x * this.scene.deltaTime;
			projectile.y += projectile.velocity.y * this.scene.deltaTime;

			if (projectile.deathTimer <= 0) {
				projectile.destroy();
				this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
				return;
			}

			projectile.deathTimer -= 1 * this.scene.deltaTime;
			let collided = false;
			this.scene.gameObjectsGroup.children.iterate(gameObject => {
				if (!gameObject) {
					return;
				}
        const intersects = Phaser.Geom.Intersects.LineToRectangle( new Phaser.Geom.Line(
					this.scene.char.self.x, projectile.originY,
					projectile.x, projectile.y
				), gameObject.getBounds());
        if (intersects) {
					collided = true;
					if (gameObject.name === "enemy") {
						gameObject.destroy();
					}
        }
			});
			if (collided) {
				this.projectiles.splice(idx, 1); // Remove reference to destroyed projectile
				projectile.destroy();
			}
		});
	}

}