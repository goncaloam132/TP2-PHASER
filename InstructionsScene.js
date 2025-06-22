class InstructionsScene extends Phaser.Scene {
  constructor() {
    super("instructionsGame");
  }

  create() {
    // Adicionar imagem de fundo
    this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    this.background.displayWidth = this.sys.game.config.width;
    this.background.displayHeight = this.sys.game.config.height;

    // Título
    this.add.bitmapText(this.cameras.main.centerX, 80, "pixelFont", "Comandos", 48).setOrigin(0.5);

    // Legenda de Comandos
    this.add.bitmapText(this.cameras.main.centerX, 150, "pixelFont", "Comandos", 32).setOrigin(0.5);
    this.add.bitmapText(150, 200, "pixelFont", "Mover:", 24).setOrigin(0.5);
    this.add.sprite(250, 200, 'player', 1).setScale(1.5);
    this.add.bitmapText(350, 200, "pixelFont", "W, A, S, D ou Setas", 24).setOrigin(0.5);

    this.add.bitmapText(150, 250, "pixelFont", "Tiro:", 24).setOrigin(0.5);
    this.add.sprite(250, 250, 'beam').setScale(1.5);
    this.add.bitmapText(350, 250, "pixelFont", "Barra de Espacos", 24).setOrigin(0.5);
    
    this.add.bitmapText(150, 300, "pixelFont", "Bomba:", 24).setOrigin(0.5);
    this.add.sprite(250, 300, 'power-up', 0).play('red').setScale(1.5);
    this.add.bitmapText(350, 300, "pixelFont", "Tecla X", 24).setOrigin(0.5);

    // Legenda de Power-ups
    this.add.bitmapText(this.cameras.main.centerX, 400, "pixelFont", "Power-Ups", 32).setOrigin(0.5);

    this.add.sprite(150, 460, 'power-up', 0).play('red').setScale(1.5);
    this.add.bitmapText(350, 460, "pixelFont", "Velocidade Aumentada", 24).setOrigin(0.5);

    this.add.sprite(150, 510, 'power-up', 2).play('gray').setScale(1.5);
    this.add.bitmapText(350, 510, "pixelFont", "Escudo (1 impacto)", 24).setOrigin(0.5);
    
    this.add.sprite(150, 560, 'power-up', 2).play('gray').setTint(0x00ff00).setScale(1.5);
    this.add.bitmapText(350, 560, "pixelFont", "Vida Extra", 24).setOrigin(0.5);

    // Botão Voltar
    let backButton = this.add.bitmapText(this.cameras.main.centerX, this.sys.game.config.height - 100, "pixelFont", "Voltar", 32)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => this.scene.start("bootGame"));
    backButton.on('pointerover', () => backButton.setTint(0x44ff44));
    backButton.on('pointerout', () => backButton.clearTint());
  }
} 