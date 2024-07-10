class Scene1 extends Phaser.Scene {
  constructor() {
    super("bootGame");
  }

  init(data) {
    this.scoreRecord = data.scoreRecord || 0;
  }

  preload() {
    // Carregar os assets de fundo e do botão
    this.load.image("background", "assets/images/background.png");
    this.load.image('startButton', 'assets/spritesheets/startbutton.png');
    
    // Carregar outros assets do jogo
    this.load.spritesheet("ship", "assets/spritesheets/ship.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("ship2", "assets/spritesheets/ship2.png", {
      frameWidth: 32,
      frameHeight: 16
    });
    this.load.spritesheet("ship3", "assets/spritesheets/ship3.png", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("power-up", "assets/spritesheets/power-up.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("player", "assets/spritesheets/player.png", {
      frameWidth: 16,
      frameHeight: 24
    });
    this.load.spritesheet("beam", "assets/spritesheets/beam.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");

    // Carregar sons
    this.load.audio("audio_beam", ["assets/sounds/beam.ogg", "assets/sounds/beam.mp3"]);
    this.load.audio("audio_explosion", ["assets/sounds/explosion.ogg", "assets/sounds/explosion.mp3"]);
    this.load.audio("audio_pickup", ["assets/sounds/pickup.ogg", "assets/sounds/pickup.mp3"]);
    this.load.audio("music", ["assets/sounds/sci-fi_platformer12.ogg", "assets/sounds/sci-fi_platformer12.mp3"]);
    this.load.audio("menuMusic", ["assets/sounds/menu.mp3"]); // Carregar a música do menu
  }

  create() {
    // Adicionar imagem de fundo
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.background.displayWidth = this.sys.game.config.width;
    this.background.displayHeight = this.sys.game.config.height;

    // Adicionar texto de título
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50, "SpaceShip", {
      font: "24px Arial",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    // Exibir o recorde
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, "Record: " + this.scoreRecord, {
      font: "16px Arial",
      fill: "#ffffff"
    }).setOrigin(0.5, 0.5);

    // Exibir botão Start Game e ajustar o tamanho
    let startButton = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'startButton')
                             .setInteractive()
                             .setScale(0.2);  

    startButton.on('pointerdown', () => {
      this.startGame();
    });

    startButton.on('pointerover', () => {
      startButton.setTint(0x44ff44);
    });

    startButton.on('pointerout', () => {
      startButton.clearTint();
    });

    // Reproduzir a música do menu com fade in, se não estiver a tocar
    if (!this.menuMusic || !this.menuMusic.isPlaying) {
      this.menuMusic = this.sound.add("menuMusic", { volume: 0, loop: true });
      this.menuMusic.play();
      this.tweens.add({
        targets: this.menuMusic,
        volume: 0.5,
        duration: 1000,
        ease: 'Linear'
      });
    }

    this.anims.create({
      key: "life",
      frames: this.anims.generateFrameNumbers("power-up", {
        start: 2, 
        end: 3   
      }),
      frameRate: 20,
      repeat: -1
    });
  }

  startGame() {
    // Parar a música do menu com fade out
    if (this.menuMusic && this.menuMusic.isPlaying) {
      this.tweens.add({
        targets: this.menuMusic,
        volume: 0,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          this.menuMusic.stop();
          this.scene.start("playGame"); // Iniciar a cena do jogo após o fade out acabar
        }
      });
    } else {
      this.scene.start("playGame"); // Iniciar a cena do jogo imediatamente se a música não estiver a tocar
    }

    // Configurar animações
    this.anims.create({
      key: "ship1_anim",
      frames: this.anims.generateFrameNumbers("ship"),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "ship2_anim",
      frames: this.anims.generateFrameNumbers("ship2"),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "ship3_anim",
      frames: this.anims.generateFrameNumbers("ship3"),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true
    });

    this.anims.create({
      key: "red",
      frames: this.anims.generateFrameNumbers("power-up", {
        start: 0,
        end: 1
      }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "gray",
      frames: this.anims.generateFrameNumbers("power-up", {
        start: 2,
        end: 3
      }),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "thrust",
      frames: this.anims.generateFrameNumbers("player"),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: "beam_anim",
      frames: this.anims.generateFrameNumbers("beam"),
      frameRate: 20,
      repeat: -1
    });
  }
}
