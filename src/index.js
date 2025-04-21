import Phaser from 'phaser';
import PreloaderScene from './js/PreloaderScene.js';
import MainScene from './js/MainScene.js';
import AdNetworkManager from './js/AdNetworkManager.js';

// Initialize the AdNetworkManager early
const adNetworkManager = new AdNetworkManager();

// Game configuration
const gameConfig = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'phaser-example',
        width: '100%',
        height: '100%'
    },
    scene: null
};

// Create the game instance but don't start any scenes yet
const game = new Phaser.Game(gameConfig);

// Add scenes and make adNetworkManager available to the game
game.scene.add("Preload", PreloaderScene);
game.scene.add("Main", MainScene);

// Make adNetworkManager accessible globally in the game
game.registry.set('adNetworkManager', adNetworkManager);

// Function to initialize the game after MRAID is ready
function initializeGame() {
    console.log('Starting game after MRAID initialization');
    
    // Notify ad network that the game ad is loaded (but not started yet)
    adNetworkManager.loadedGameAd();
    
    // Start the preloader scene
    game.scene.start("Preload");
}

// Check for MRAID and wait for it to be ready
if (typeof mraid !== 'undefined') {
    console.log('MRAID found, checking state');
    
    // If MRAID is already in ready state
    if (mraid.getState() === 'ready') {
        console.log('MRAID already in ready state, starting game');
        adNetworkManager.isAdReady = true;
        initializeGame();
    } else {
        // Listen for MRAID ready event
        console.log('Waiting for MRAID ready event');
        mraid.addEventListener('ready', function() {
            console.log('MRAID ready event received, starting game');
            adNetworkManager.isAdReady = true;
            initializeGame();
        });
    }
} else {
    // MRAID is not available (development environment)
    console.log('MRAID not available, starting game in development mode');
    adNetworkManager.isAdReady = true;
    initializeGame();
}
