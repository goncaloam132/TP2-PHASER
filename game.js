var gameSettings = {
  playerSpeed: 200,
  maxPowerups: 2,
  powerUpVel: 50,
}

var config = {
  width: 662,
  height: 710,
  backgroundColor: 0x000000,
  scene: [Scene1, Scene2, InstructionsScene],
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade:{
        debug: false,
        debugShowVelocity: false
    }
  }
}


var game = new Phaser.Game(config);
