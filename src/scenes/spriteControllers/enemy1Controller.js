export default class enemy1Controller {
  constructor(scene) {
    this.scene = scene;
  }

	createEnemy() {
		this.enemyGroup = this.scene.physics.add.group({
			defaultKey: 'enemy',
			maxSize: 50,
			createCallback: function (enemy) {
			}
		});
	}

	spawnEnemy(x, y) {
		var curEnemy = this.scene.add.rectangle(x, y, 20, 50, 0xffffff, 1);
		curEnemy.name = 'enemy';
		this.enemyGroup.add(curEnemy);
		this.scene.gameObjectsGroup.add(curEnemy);
	}
}