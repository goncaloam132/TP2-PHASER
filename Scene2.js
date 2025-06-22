class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame");
    this.scoreRecord = 0;
    this.doubleShotThreshold = 200; 
    this.tripleShotThreshold = 400;
    this.startingLives = 1;
  }

  create() {
    this.background = this.add.tileSprite(0, 0, config.width, config.height, "background");
    this.background.setOrigin(0, 0);
    
    const bgTexture = this.textures.get('background');
    if (bgTexture.key !== '__MISSING') {
      const bgImage = bgTexture.getSourceImage();
      const scale = this.sys.game.config.width / bgImage.width;
      this.background.tileScaleX = scale;
      this.background.tileScaleY = scale;
    }

    this.ship1 = this.add.sprite(config.width / 2 - 50, config.height / 2, "ship").setScale(2);
    this.ship1.speed = 1;
    this.ship2 = this.add.sprite(config.width / 2, config.height / 2, "ship2").setScale(2);
    this.ship2.speed = 2;
    this.ship3 = this.add.sprite(config.width / 2 + 50, config.height / 2, "ship3").setScale(2);
    this.ship3.speed = 3;

    this.enemies = this.physics.add.group();
    this.enemies.add(this.ship1);
    this.enemies.add(this.ship2);
    this.enemies.add(this.ship3);

    this.ship1.play("ship1_anim");
    this.ship2.play("ship2_anim");
    this.ship3.play("ship3_anim");

    this.ship1.setInteractive();
    this.ship2.setInteractive();
    this.ship3.setInteractive();

    this.input.on('gameobjectdown', this.destroyShip, this);

    this.physics.world.setBoundsCollision();

    this.powerUps = this.physics.add.group();
    this.spawnPowerUpSet();
    this.nextPowerUpScore = 200;
    this.powerUpScoreGap = 100;

    this.difficultyLevel = 1;
    this.nextLevelScore = 200;

    this.player = this.physics.add.sprite(config.width / 2 - 8, config.height - 64, "player").setScale(2);
    this.player.isShielded = false;
    this.player.play("idle");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');
    this.player.setCollideWorldBounds(true);

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.bombKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.projectiles = this.add.group();
    this.enemyProjectiles = this.add.group();

    this.physics.add.collider(this.projectiles, this.powerUps, function (projectile, powerUp) {
      projectile.destroy();
    });

    this.physics.add.overlap(this.player, this.powerUps, this.pickPowerUp, null, this);

    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);

    this.physics.add.overlap(this.projectiles, this.enemies, this.hitEnemy, null, this);

    this.physics.add.overlap(this.player, this.enemyProjectiles, this.hurtPlayerByBullet, null, this);

    var graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(0, 0);
    graphics.lineTo(config.width, 0);
    graphics.lineTo(config.width, 20);
    graphics.lineTo(0, 20);
    graphics.lineTo(0, 0);
    graphics.closePath();
    graphics.fillPath();

    this.score = 0;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE " + scoreFormated, 32);

    var scoreRecordFormatted = this.zeroPad(this.scoreRecord, 6);
    this.scoreRecordLabel = this.add.bitmapText(config.width - 10, 5, "pixelFont", "RECORD " + scoreRecordFormatted, 32).setOrigin(1, 0);

    this.lives = this.startingLives;
    this.livesIcons = this.add.group();
    this.updateLifeIcons();

    this.bombs = 2;
    this.bombIcons = this.add.group();
    this.updateBombIcons();

    this.originalPlayerSpeed = gameSettings.playerSpeed;

    // Criação de sons
    this.beamSound = this.sound.add("audio_beam");
    this.explosionSound = this.sound.add("audio_explosion");
    this.pickupSound = this.sound.add("audio_pickup");

    // Criação de musica
    this.music = this.sound.add("music");

    var musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0
    };

    this.music.play(musicConfig);

    this.enemyFireLoop = this.time.addEvent({
      delay: 1000,
      callback: this.enemyFire,
      callbackScope: this,
      loop: true
    });

    this.bossScoreTrigger = 500;
    this.bossIsActive = false;
    this.bossSpawned = false;
  }

  pickPowerUp(player, powerUp) {
    powerUp.destroy();
    this.pickupSound.play();

    switch (powerUp.type) {
      case "red":
        this.boostSpeed();
        break;
      case "gray":
        this.activateShield();
        break;
      case "life":
        this.lives++;
        this.updateLifeIcons();
        break;
    }
  }

  hurtPlayer(player, enemy) {
    if (enemy) {
      this.resetShipPos(enemy);
    }
    this.damagePlayer();
  }

  hurtPlayerByBullet(player, bullet) {
    bullet.destroy();
    this.damagePlayer();
  }

  damagePlayer() {
    if (this.player.alpha < 1) {
      return;
    }

    if (this.player.isShielded) {
      this.player.isShielded = false;
      this.player.clearTint();
      return;
    }

    this.cameras.main.flash(250, 255, 0, 0);

    var explosion = new Explosion(this, this.player.x, this.player.y);

    this.player.disableBody(true, true);

    this.lives--;
    this.updateLifeIcons();

    if (this.lives > 0) {
      this.resetPlayer();
    } else {
      if (this.score > this.scoreRecord) {
        this.scoreRecord = this.score;
      }

      this.music.stop();

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          this.scene.start('bootGame', { scoreRecord: this.scoreRecord });
        },
        callbackScope: this,
        loop: false
      });
    }
  }

  resetPlayer() {
    var x = config.width / 2 - 8;
    var y = config.height + 64;
    this.player.enableBody(true, x, y, true, true);

    this.player.isShielded = false;
    this.player.clearTint();

    this.player.alpha = 0.5;

    var tween = this.tweens.add({
      targets: this.player,
      y: config.height - 64,
      ease: 'Power1',
      duration: 1500,
      repeat: 0,
      onComplete: function () {
        this.player.alpha = 1;
      },
      callbackScope: this
    });
  }

  hitEnemy(projectile, enemy) {
    var explosion = new Explosion(this, enemy.x, enemy.y);

    projectile.destroy();
    this.resetShipPos(enemy);
    this.score += 15;

    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;

    this.explosionSound.play();

    if (this.score > this.tripleShotThreshold) {
      this.shotMode = 3;
    } else if (this.score > this.doubleShotThreshold) {
      this.shotMode = 2;
    }
  }

  zeroPad(number, size) {
    var stringNumber = String(number);
    while (stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }

  update() {
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        this.moveShip(enemy, enemy.speed);
      }
    });

    this.background.tilePositionY -= 0.5;
    this.movePlayerManager();

    if (this.score >= this.nextPowerUpScore) {
      this.spawnPowerUpSet();
      this.nextPowerUpScore += this.powerUpScoreGap;
      this.powerUpScoreGap += 50;
    }

    if (this.score >= this.nextLevelScore) {
      this.levelUp();
    }

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      if (this.player.active) {
        this.shootBeam();
      }
    }
    
    for (var i = 0; i < this.projectiles.getChildren().length; i++) {
      var beam = this.projectiles.getChildren()[i];
      beam.update();
    }
    
    for (var i = 0; i < this.enemyProjectiles.getChildren().length; i++) {
      var beam = this.enemyProjectiles.getChildren()[i];
      beam.update();
    }

    if (Phaser.Input.Keyboard.JustDown(this.bombKey)) {
      this.useBomb();
    }
  }

  shootBeam() {
    if (this.score >= this.tripleShotThreshold) {
      // Disparar três tiros após ultrapassar 400 pontos
      new Beam(this, this.player.x - 10, this.player.y - 16);
      new Beam(this, this.player.x, this.player.y - 16);
      new Beam(this, this.player.x + 10, this.player.y - 16);
    } else if (this.score >= this.doubleShotThreshold) {
      // Disparar dois tiros após ultrapassar 200 pontos
      new Beam(this, this.player.x - 10, this.player.y - 16);
      new Beam(this, this.player.x + 10, this.player.y - 16);
    } else {
      // Disparar um tiro antes de ultrapassar 200 pontos
      new Beam(this, this.player.x, this.player.y - 16);
    }
    this.beamSound.play();
  }

  movePlayerManager() {
    this.player.setVelocity(0);

    if (this.cursorKeys.left.isDown || this.wasdKeys.A.isDown) {
      this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.right.isDown || this.wasdKeys.D.isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
    }

    if (this.cursorKeys.up.isDown || this.wasdKeys.W.isDown) {
      this.player.setVelocityY(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.down.isDown || this.wasdKeys.S.isDown) {
      this.player.setVelocityY(gameSettings.playerSpeed);
    }

    if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
      this.player.play("thrust", true);
    } else {
      this.player.play("idle", true);
    }
  }

  moveShip(ship, speed) {
    ship.y += speed;
    if (ship.y > config.height) {
      this.resetShipPos(ship);
    }
  }

  resetShipPos(ship) {
    ship.y = 0;
    var randomX = Phaser.Math.Between(0, config.width);
    ship.x = randomX;
    this.addHorizontalTween(ship);
  }

  destroyShip(pointer, gameObject) {
    gameObject.setTexture("explosion");
    gameObject.play("explode");
  }

  updateLifeIcons() {
    this.livesIcons.clear(true, true);

    for (let i = 0; i < this.lives; i++) {
      let iconX = 20 + (i * 30);
      let icon = this.add.sprite(iconX, this.sys.game.config.height - 20, 'player', 0).setOrigin(0.5, 0.5);
      icon.setScale(1.5);
      this.livesIcons.add(icon);
    }
  }

  activateShield() {
    if (this.player.isShielded) {
      return;
    }
    this.player.isShielded = true;
    this.player.setTint(0x00ff00);
  }

  boostSpeed() {
    if (this.speedBoostTimer) {
      this.speedBoostTimer.remove(false);
    }

    gameSettings.playerSpeed = this.originalPlayerSpeed * 1.5;

    this.speedBoostTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        gameSettings.playerSpeed = this.originalPlayerSpeed;
        this.speedBoostTimer = null;
      },
      callbackScope: this
    });
  }

  useBomb() {
    if (this.bombs > 0) {
      this.bombs--;
      this.updateBombIcons();

      this.explosionSound.play();

      this.enemies.getChildren().forEach(enemy => {
        if (enemy.active) {
          var explosion = new Explosion(this, enemy.x, enemy.y);
          this.resetShipPos(enemy);
          this.score += 15;
        }
      });
      
      var scoreFormated = this.zeroPad(this.score, 6);
      this.scoreLabel.text = "SCORE " + scoreFormated;
    }
  }

  updateBombIcons() {
    this.bombIcons.clear(true, true);

    for (let i = 0; i < this.bombs; i++) {
      let iconX = this.sys.game.config.width - 20 - (i * 30);
      let icon = this.add.sprite(iconX, this.sys.game.config.height - 20, 'power-up', 0).setOrigin(0.5, 0.5);
      icon.play('red');
      icon.setScale(1.5);
      this.bombIcons.add(icon);
    }

    for (var i = 0; i < this.enemyProjectiles.getChildren().length; i++) {
      var beam = this.enemyProjectiles.getChildren()[i];
      beam.update();
    }
  }

  enemyFire() {
    const activeEnemies = this.enemies.getChildren().filter(enemy => enemy.active);
    if (activeEnemies.length > 0) {
      const randomEnemy = Phaser.Utils.Array.GetRandom(activeEnemies);
      new EnemyBeam(this, randomEnemy.x, randomEnemy.y + 32);
    }

    this.addHorizontalTween(this.ship1);
    this.addHorizontalTween(this.ship2);
    this.addHorizontalTween(this.ship3);
  }

  addHorizontalTween(ship) {
    if (ship.moveTween) {
      ship.moveTween.stop();
    }

    const duration = Phaser.Math.Between(2000, 4000);
    const offsetX = Phaser.Math.Between(50, 150);

    ship.moveTween = this.tweens.add({
      targets: ship,
      x: ship.x + offsetX,
      ease: 'Sine.easeInOut',
      duration: duration,
      yoyo: true,
      repeat: -1,
      onYoyo: () => {
        ship.x = Math.max(0, Math.min(this.sys.game.config.width, ship.x));
      },
      onRepeat: () => {
        ship.x = Math.max(0, Math.min(this.sys.game.config.width, ship.x));
      }
    });
  }

  spawnPowerUpSet() {
    this.spawnSpecificPowerUp("red");
    this.spawnSpecificPowerUp("gray");
    this.spawnSpecificPowerUp("life");
  }

  spawnSpecificPowerUp(type) {
    var x = Phaser.Math.Between(32, this.sys.game.config.width - 32);
    var y = Phaser.Math.Between(32, this.sys.game.config.height / 2);

    var powerUp = this.physics.add.sprite(x, y, "power-up").setScale(2);
    this.powerUps.add(powerUp);
    powerUp.type = type;

    if (type === "red") {
      powerUp.play("red");
    } else if (type === "gray") {
      powerUp.play("gray");
    } else if (type === "life") {
      powerUp.play("gray");
      powerUp.setTint(0x00ff00);
    }

    powerUp.setVelocity(gameSettings.powerUpVel, gameSettings.powerUpVel);
    powerUp.setCollideWorldBounds(true);
    powerUp.setBounce(1);
  }

  levelUp() {
    this.difficultyLevel++;
    this.nextLevelScore += 200;
    
    let ship1 = this.add.sprite(Phaser.Math.Between(0, config.width), 0, "ship").setScale(2);
    ship1.speed = 1;
    this.enemies.add(ship1);
    ship1.play("ship1_anim");
    ship1.setInteractive();
    this.addHorizontalTween(ship1);

    let ship2 = this.add.sprite(Phaser.Math.Between(0, config.width), 0, "ship2").setScale(2);
    ship2.speed = 2;
    this.enemies.add(ship2);
    ship2.play("ship2_anim");
    ship2.setInteractive();
    this.addHorizontalTween(ship2);

    let ship3 = this.add.sprite(Phaser.Math.Between(0, config.width), 0, "ship3").setScale(2);
    ship3.speed = 3;
    this.enemies.add(ship3);
    ship3.play("ship3_anim");
    ship3.setInteractive();
    this.addHorizontalTween(ship3);
  }
}