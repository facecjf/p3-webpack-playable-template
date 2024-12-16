import Phaser from "phaser";
import * as AdNetworkManager from './AdNetworkManager';
import { ResponsiveSettings } from './ResponsiveSettings';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Main' }); // Set the scene key
        this.adNetworkManager = new AdNetworkManager.default(); // Initialize ad network manager
        this.currentLanguage = 'en-us'; // Default language
        //this.timeRemaining = 30; // Initial time for the countdown timer
        this.timerStarted = false; // Flag to check if timer has started
        this.tutTextTween = null; // Tween for tutorial text animation
        this.tutTextBaseScale = 1; // Base scale for tutorial text
        this.gameStep = 0; // game step to track updates
        this.gamePhase = 0; // game phases
        this.startGame = false;
        this.firstClick = false;
        this.gameOver = false;
        this.ctaClicked = false;
        this.inactiveTime = 4000; // inactive time
        this.isInactivity = false;
        this.inactivityEvent = null;
        this.logoScale = 0.45; // starting logo scale
        this.ctaScale = 0.45; // starting cta scale

        //properties for UI hand positions
        this.handAngle = 0;
        this.handAngleOpo = 0;
        this.uiHandStartX = 0;
        this.uiHandStartY = 0;
        this.uiHandEndX = 0;
        this.uiHandEndY = 0;

    }

    // Create the scene
    create() {
        console.log('%cSCENE::Main', 'color: #fff; background: #ab24f8;')

        // Initialize ResponsiveSettings with scene reference
        this.responsiveSettings = new ResponsiveSettings(this);
        
        // Access responsive properties directly
        this.gameWidth = this.responsiveSettings.gameWidth;
        this.gameHeight = this.responsiveSettings.gameHeight;
        this.centerX = this.responsiveSettings.centerX;
        this.centerY = this.responsiveSettings.centerY;
        this.scaleFactor = this.responsiveSettings.scaleFactor;
        this.isPortrait = this.responsiveSettings.isPortrait;

        // Load language data from cache
        this.languageData = this.cache.json.get('languages');
        
        // Fallback language data if not loaded
        if (!this.languageData) {
            console.warn('Language data not loaded. Using fallback.');
            this.languageData = {
                en: {
                    play_now: '!!PLAY NOW!!',
                    game_tut: '!!TUTORIAL MSG!!'
                    // ... other fallback texts ...
                }
            };
        }

        // Initialize game components
        this.initializeGameVariables();
        this.createGameObjects();
        this.setupEventListeners();
        this.createUIHand();

        // Notify ad network that game ad is loaded
        this.adNetworkManager.loadedGameAd();
    }

    
    // Initialize various game state variables
    initializeGameVariables() {
        // define specific game variable after start outside of the constructor ex: this.variable = true;
        this.gameTop = 0;
        this.gameBottom = this.gameHeight;
        this.gameRight = this.gameWidth;
        this.gameLeft = 0;
    }

    // Create and position game objects (background, logo, CTA, etc.)
    createGameObjects() {
        // Background
        this.bg = this.add.image(this.centerX, this.centerY, "bg");
        this.ecbg = this.add.image(this.centerX, this.centerY, "ecbg");
        this.ecbg.visible = false;

        // resize background
        this.resizeBackground();

        // Logo and CTA
        this.setupUI();

        // Create tutorial message
        this.createTutorialMessage();

        // Set initial UI hand positions
        this.uiHandStartX = this.centerX - 120 * this.scaleFactor;
        this.uiHandStartY = this.centerY + 120 * this.scaleFactor;
        this.uiHandEndX = this.centerX + 120 * this.scaleFactor;
        this.uiHandEndY = this.centerY + 120 * this.scaleFactor;

        // Overlay for End Card
        this.overlay = this.add.graphics();

        // Start Tut Tween
        this.startTutTextTween();

        // Start Embers
        this.createEmberEmitter();

        // ADD CALLS TO NEW GAME METHODS HERE
    }

    //// ADD NEW GAME METHODS HERE







    //// ADD NEW GAME METHODS HERE

    // creat CTA
    setupUI() {
        // Logo
        const topElementsY = 90 * this.scaleFactor;
        this.logo = this.add.image(20, topElementsY, "logo")
            .setScale(this.logoScale * this.scaleFactor)
            .setOrigin(0, 0.5);

        // CTA
        this.CTA = this.add.image(this.gameWidth - 20, topElementsY, "cta")
            .setInteractive()
            .setScale(this.ctaScale * this.scaleFactor)
            .setOrigin(1, 0.5);

        // Set text size based on language
        if (this.currentLanguage === 'es') {
            this.CTATextSize = 56;
            this.tutTextSize = 42;
        } else if(this.currentLanguage === 'fr') {
            this.CTATextSize = 56;
            this.tutTextSize = 42;
        // Add more languages here
        // else if(this.currentLanguage === 'jp') {
        //     this.textSize = 56;
        // }
        } else {
            this.CTATextSize = 72;
            this.tutTextSize = 42;
        }

        // Add CTA text
        this.ctaText = this.add.bitmapText(this.CTA.x, this.CTA.y, 'gameFont', this.getLocalizedText('play_now'), this.CTATextSize, 1)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setDepth(21);
        
        // Immediately update CTA text position and scale
        this.updateCTATextPosition();

        // Legal
        this.legal = this.add.image(this.centerX, this.gameHeight - 35 * this.scaleFactor, "legal")
            .setScale(this.scaleFactor);
        // Disclaimer
        this.disclaimer = this.add.image(this.centerX, this.gameHeight - 20 * this.scaleFactor, "disclaimer")
            .setScale(this.scaleFactor);
    }

    // Create tutorial message
    createTutorialMessage() {
        const topElementsY = 90 * this.scaleFactor;
        const tutY = this.isPortrait ? topElementsY + 100 * this.scaleFactor : topElementsY;

        // Tutorial BG
        // this.tutBG = this.add.image(this.centerX, tutBGY, "tutbg")
        //     .setDepth(10)
        //     .setScale(this.scaleFactor);
        
        // Add bitmap text to tutBG
        this.tutText = this.add.bitmapText(this.centerX, tutY, 'gameFont', this.getLocalizedText('game_tut'), this.tutTextSize, 1)
            .setDepth(11)
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        this.tutTextBaseScale = this.scaleFactor; // Set the base scale
        this.tutText.setScale(this.tutTextBaseScale);
    }

    // Start the tutorial text tween animation
    startTutTextTween() {
        this.tutTextTween = this.tweens.add({
            targets: this.tutText,
            scaleX: this.tutTextBaseScale * 1.1,
            scaleY: this.tutTextBaseScale * 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    // Stop the tutorial text tween animation
    stopTutTextTween() {
        if (this.tutTextTween) {
            this.tutTextTween.stop();
            this.tutTextTween = null;
            this.tutText.setScale(this.tutTextBaseScale);
        }
    }

    // Create and set up the UI hand for guiding user interactions
    createUIHand() {
    const uiHand = this.add.image(this.uiHandStartX, this.uiHandStartY, 'uihand')
            .setDepth(20)
            .setScale(this.scaleFactor);
        
        let currentTween = null;

        const createTween = () => {
            if (currentTween) currentTween.stop();
            currentTween = this.tweens.add({
                targets: uiHand,
                x: this.uiHandEndX,
                y: this.uiHandEndY,
                ease: 'Sine.easeInOut',
                duration: 1000,
                repeat: -1,
                yoyo: true
            });
        };

        const setPosition = (startX, startY, endX, endY) => {
            this.uiHandStartX = startX;
            this.uiHandStartY = startY;
            this.uiHandEndX = endX;
            this.uiHandEndY = endY;
            uiHand.setPosition(startX, startY);
            createTween();
        };

        const hide = () => {
            uiHand.setAlpha(0);
            if (currentTween) currentTween.stop();
        };

        const show = () => {
            uiHand.setAlpha(1);
            createTween();
        };

        const stopTween = () => {
            if (currentTween) currentTween.stop();
        };

        const resize = (newScale) => {
            uiHand.setScale(newScale);
        };

        createTween();

        this.uiHandController = { uiHand, setPosition, hide, show, stopTween, resize };
        
        this.updateUIHandPosition();
    }

    // Update UI hand position based on game state
    updateUIHandPosition() {
        if (this.gameOver && this.gamePhase >= 3) {
            if (this.uiHandController) {
                this.uiHandController.hide();
            }
            return;
        }
        if (this.uiHandController) {
            this.uiHandController.setPosition(
                this.uiHandStartX,
                this.uiHandStartY,
                this.uiHandEndX,
                this.uiHandEndY
            );
            this.uiHandController.resize(this.scaleFactor);

            if (!this.gameOver) {
                this.uiHandController.show();
            }
        }
    }

    // Create ember particle emitter
    createEmberEmitter() {
        //const yOffset = this.isPortrait ? 350 * this.scaleFactor : 200 * this.scaleFactor;
        // Create the emitter
        this.emberEmitter = this.add.particles(0, 0, 'ember', {
            x: { min: 0, max: this.gameWidth },
            y: this.gameHeight,
            speed: { min: 25, max: 75 },
            angle: { min: 180, max: 360 },
            scale: { start: 1.25 * this.scaleFactor, end: 0.25 * this.scaleFactor },
            alpha: { start: 1, end: 0},
            lifespan: { min: 8000, max: 12000 },
            gravityY: -10,
            frequency: 80,
            blendMode: 'ADD',
            quantity: 1,
            advance: 4000,
            deathZone: {
                type: 'onLeave',
                source: new Phaser.Geom.Rectangle(0, 0, this.gameWidth, this.gameHeight)
            }
        }).setDepth(10);
    }

    // Stop and destroy ember emitter
    stopEmberEmitter() {
        if (this.emberEmitter) {
            this.emberEmitter.destroy();
            this.emberEmitter = null;
        }
    }

    // Reposition ember emitter
    repositionEmberEmitter() {
        if (this.emberEmitter) {
            this.emberEmitter.setPosition(this.centerX, this.gameHeight);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Set up event listeners for user interactions
        this.scale.on('resize', this.resize, this);
        window.addEventListener('resize', () => this.resize());

        this.input.on('pointerdown', this.handleGlobalClick, this);
        this.CTA.on('pointerdown', this.handleCTAClick, this);
    }

    // Handle game resize events
    resize() {
        // reset inactivity timer
        if (!this.gameOver && this.isInactivity) {
            this.inactivityTimer();
            this.isInactivity = false;
        }
        // stop ember emitter
        this.stopEmberEmitter();
        
        this.responsiveSettings.initializeResponsiveDesign();
        // Update local references
        this.gameWidth = this.responsiveSettings.gameWidth;
        this.gameHeight = this.responsiveSettings.gameHeight;
        this.centerX = this.responsiveSettings.centerX;
        this.centerY = this.responsiveSettings.centerY;
        this.scaleFactor = this.responsiveSettings.scaleFactor;
        this.isPortrait = this.responsiveSettings.isPortrait;

        this.resizeBackground();
        this.repositionHandler();
        this.updateUIHandPosition();

        // create ember emitter
        this.createEmberEmitter();
    }

    // Resize background images based on orientation
    resizeBackground() {
        if (this.isPortrait) {
            this.bg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.ecbg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.bg.setPosition(this.centerX, this.centerY);
            this.ecbg.setPosition(this.centerX, this.centerY);
        } else {
            this.bg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.ecbg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.bg.setPosition(this.centerX, this.centerY);
            this.ecbg.setPosition(this.centerX, this.centerY);
        }
    }

    // Reposition handler
    repositionHandler() {
        if (this.gameOver && this.gamePhase >= 3) {
            // End module layout
            this.repositionEndModuleAssets();
        } else {
            // Regular game layout
            this.repositionGameAssets();
        }

        // Common elements
        this.legal.setPosition(this.centerX, this.gameHeight - 35 * this.scaleFactor)
            .setScale(this.scaleFactor);
        this.disclaimer.setPosition(this.centerX, this.gameHeight - 20 * this.scaleFactor)
            .setScale(this.scaleFactor);

        // Move this line to the end of the method
        if (!this.gameOver || this.gamePhase < 3) {
            this.updateUIHandPosition();
        }
    }

    // Reposition regular game assets
    repositionGameAssets() {
        // Regular game layout positioning
        const topElementsY = 90 * this.scaleFactor;

        this.logo.setPosition(20, topElementsY);
        this.logo.setScale(this.logoScale * this.scaleFactor);
        
        this.CTA.setPosition(this.gameWidth - 20, topElementsY);
        this.CTA.setScale(this.ctaScale * this.scaleFactor);
        this.updateCTATextPosition();

        const tutY = this.isPortrait ? topElementsY + 100 * this.scaleFactor : topElementsY;
        // this.tutBG.setPosition(this.centerX, tutBGY).setScale(this.scaleFactor);
        
        this.tutTextBaseScale = this.scaleFactor;
        this.tutText.setPosition(this.centerX, tutY);
        
        if (this.tutTextTween && this.tutTextTween.isPlaying()) {
            this.stopTutTextTween();
            this.startTutTextTween();
        } else {
            this.tutText.setScale(this.tutTextBaseScale);
        }
        // Update UI hand positions relative to new dimensions
        const handOffsetX = 120 * this.scaleFactor;
        const handOffsetY = 120 * this.scaleFactor;
        
        this.uiHandStartX = this.centerX - handOffsetX;
        this.uiHandStartY = this.centerY + handOffsetY;
        this.uiHandEndX = this.centerX + handOffsetX;
        this.uiHandEndY = this.centerY + handOffsetY;

        // If the UI hand controller exists, update its position
        if (this.uiHandController) {
            this.uiHandController.setPosition(
                this.uiHandStartX,
                this.uiHandStartY,
                this.uiHandEndX,
                this.uiHandEndY
            );
            this.uiHandController.resize(this.scaleFactor);
        }
    }

    // Reposition assets for end module
    repositionEndModuleAssets() {
        this.logo.setPosition(this.centerX, 200 * this.scaleFactor);
        this.logo.setScale(1 * this.scaleFactor);

        this.CTA.setPosition(this.centerX, (this.gameHeight - 200 * this.scaleFactor));
        this.CTA.setScale(0.85 * this.scaleFactor);

        this.updateCTATextPosition();

        // Resize overlay
        this.overlay.clear();
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);

        // Ensure these elements remain hidden
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
    }

    // Update CTA text position and scale
    updateCTATextPosition() {
        if (this.ctaText && this.CTA) {
            const ctaCenterX = this.CTA.x - (this.CTA.displayWidth * (-0.5 + this.CTA.originX));
            this.ctaText.setPosition(ctaCenterX, this.CTA.y);
            this.ctaText.setScale(this.CTA.scale * 0.8);
        }
    }

    // Handle CTA click
    handleCTAClick() {
        // Handle CTA button click
        if (!this.ctaClicked && !this.gameOver) {
            this.ctaClicked = true;
            this.endGameAd();
            this.clickCTA();
        }
    }

    // Handle CTA click
    clickCTA() {
        // Actions to perform when CTA is clicked
        this.adNetworkManager.clickCTA();
        // Add any additional CTA click logic here
        if (this.gamePhase < 3) {
            this.gameOver = true;
            this.gameOverMan();
            this.gamePhase = 3;
        }
    }

    // Remove UI hand tweens
    removeTweens() {
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
    }

    // Handle inactivity
    inactivityTimer() {
        // Handle inactivity
        if (this.gameOver) {
            this.time.removeEvent(this.inactivityEvent);
        }
        this.updateUIHandPosition();
        // this.startTutTextTween();
        console.log('inactivity timer reset');
        this.isInactivity = false;
        this.time.removeEvent(this.inactivityEvent);
        this.inactivityEvent = null;
        this.inactiveTime = 4000;        
    }

    // Reset the inactivity timer
    resetInactivityTimer() {
        this.time.removeEvent(this.inactivityEvent);
        this.inactivityEvent = this.time.addEvent({ delay: this.inactiveTime, callback: this.inactivityTimer, callbackScope: this });
        console.log('inactivity timer started');
        this.isInactivity = true;
    }
    
    // Handle global click events
    handleGlobalClick() {
        // Handle global click events
        if (this.gameOver && this.gamePhase > 2) {
            if (!this.ctaClicked) {
                this.ctaClicked = true;
                this.clickCTA();
            }
        } else if (!this.firstClick && !this.gameOver) {
            this.firstClick = true;
            console.log('first click!');
            this.removeTweens();
            this.stopTutTextTween();
            this.resetInactivityTimer();
        } else {
            console.log('click / ui hand reset works!');
            this.removeTweens();
            this.stopTutTextTween();
            this.resetInactivityTimer();
        }
    }

    // Handle end of game transition
    transitionEnd() {
        // Stop any ongoing game logic
        this.gameOver = true;
        this.removeTweens();

        // Hide tutorial and timer elements
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);

        // Display "Time's Up!" text
        const timesUpText = this.add.bitmapText(this.centerX, this.centerY, 'gameFont', this.getLocalizedText('TIME\'S UP!'), 64)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setAlpha(0);

        // Fade in the "Time's Up!" text
        this.tweens.add({
            targets: timesUpText,
            alpha: 1,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Wait for 2 seconds, then transition to endModual
                this.time.delayedCall(2000, () => {
                    timesUpText.destroy();
                    this.gameOverMan();
                });
            }
        });
    }

    // Handle game over state
    gameOverMan() {
        // Handle game over state
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
        
        this.endModual();
        this.removeTweens();
        
        if (!this.firstClick) {
            this.gamePhase++;
            this.firstClick = true;
        }
        console.log(this.gamePhase);

        // Start the CTA tween when the game ends
        this.setupCTATween();

        // Remove interactivity from CTA
        this.CTA.removeInteractive();
    }

    // Set up end module display
    endModual() {
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.bg.visible = false;
        this.ecbg.visible = true;

        this.logo.setOrigin(0.5);
        this.logo.setDepth(20);
        
        this.CTA.setDepth(20);
        this.CTA.setOrigin(0.5);
        
        this.repositionEndModuleAssets();

        // Hide tutorial and timer elements
        //this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
    }

    // End game ad
    endGameAd() {
        this.adNetworkManager.endGameAd();
    }

    // Start game ad
    startGameAd() {
        this.adNetworkManager.startGameAd();
    }

    // Set up CTA button tween animation
    setupCTATween() {
        // Stop any existing tween
        if (this.ctaTween) {
            this.ctaTween.stop();
        }

        // Create a new tween
        this.ctaTween = this.tweens.add({
            targets: this.CTA,
            scaleX: this.CTA.scaleX * 1.1,
            scaleY: this.CTA.scaleY * 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                this.updateCTATextPosition();
            }
        });
    }

    // Get localized text based on current language
    getLocalizedText(key) {
        if (this.languageData && this.languageData[this.currentLanguage] && this.languageData[this.currentLanguage][key]) {
            return this.languageData[this.currentLanguage][key];
        }
        return key; // Fallback to key if translation not found
    }

    // Set the current language
    setLanguage(languageCode) {
        if (this.languageData[languageCode]) {
            this.currentLanguage = languageCode;
            this.updateAllText();
        } else {
            console.warn(`Language ${languageCode} not found in language data.`);
        }
    }

    // Update all text elements with new language
    updateAllText() {
        if (this.ctaText) {
            this.ctaText.setText(this.getLocalizedText('play_now'));
            this.updateCTATextPosition();
        }
        // Update other text elements as needed
    }

    // Update loop
    update() {
        // Game update loop
        if (this.gamePhase == 0 && !this.gameOver) {
            console.log('Phase 1 Tutorial');
            // Notify ad network that game ad is starting
            this.startGameAd();
            this.gamePhase++;
        } else if (this.gamePhase == 1 && !this.gameOver) {
            if (this.firstClick) {
                console.log('Phase 2 Start');
                this.startGame = true;
                this.gamePhase++;
            }
        } else if (this.gamePhase == 2 && this.gameOver) {
            console.log('Phase 3 Game Over EM');
            this.endGameAd();
            this.gamePhase++;
        } else if (this.gamePhase == 3 && this.gameOver) {
            if (this.ctaClicked) {
                console.log('Phase 4 Return Modual');
                this.gamePhase++;
            }
        }
    }
}

// Global functions (required for ad network)
window.gameStart = function() {
    parent.postMessage("start", "*");
    console.log("game started");
};

window.gameClose = function() {
    parent.postMessage("complete", "*");
    console.log("game completed");
};

window.muteGameSound = function(scene) {
    scene.sound.setMute(true);
};
