import Phaser from 'phaser';
import PreloaderScene from './js/PreloaderScene.js';
import MainScene from './js/MainScene.js';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    backgroundColor: '#7720a8',
    scale: {
        mode: Phaser.Scale.FIT,
        width: 639,
        height: 1136,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: null
};
const game = new Phaser.Game(gameConfig);

game.scene.add("Preload", PreloaderScene);
game.scene.add("Main", MainScene);

game.scene.start("Preload");
