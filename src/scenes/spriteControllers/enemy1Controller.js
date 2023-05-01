export default class enemy1Controller {
  constructor(scene) {
    this.scene = scene;
  }

	createEnemy() {
		this.enemyGroup = this.scene.physics.add.group({
			defaultKey: 'enemy',
			maxSize: 50,
			createCallback: function (enemy) {
				enemy.body.setCollideWorldBounds(true, 1, 1);
			}
		});
	}

	spawnEnemy() {
		var curEnemy = this.scene.add.rectangle(500, 350, 20, 50, 0xffffff, 1);
		curEnemy.name = 'enemy';
		this.enemyGroup.add(curEnemy);
		this.scene.gameObjectsGroup.add(curEnemy);
	}
}