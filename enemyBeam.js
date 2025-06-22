class EnemyBeam extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "beam");

    scene.add.existing(this);
    this.play("beam_anim");
    this.setScale(2);
    scene.physics.world.enableBody(this);
    this.body.velocity.y = 200;

    scene.enemyProjectiles.add(this);

    this.setTint(0xff0000);
  }

  update() {
    if (this.y > config.height) {
      this.destroy();
    }
  }
} 