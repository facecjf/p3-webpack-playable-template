import Phaser from 'phaser';
import PreloaderScene from './js/PreloaderScene.js';
import MainScene from './js/MainScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'phaser-example',
        width: window.innerWidth,
        height: window.innerHeight
    },
    input: {
        windowEvents: false  // Disable window-level events to avoid window.top usage
    },
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         debug: true
    //     }
    // },
    scene: null
};

window.bootGame = function() {
    const game = new Phaser.Game(gameConfig);
    game.scene.add("Preload", PreloaderScene);
    game.scene.add("Main", MainScene);
    game.scene.start("Preload");
};

// turn off for Ironsource Builds
// may cause issues if left on on other ad networks.
window.bootGame();
