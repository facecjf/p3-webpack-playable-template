import Phaser from "phaser";
import * as AdNetworkManager from './AdNetworkManager';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Main' }); // Set the scene key
        this.adNetworkManager = new AdNetworkManager.default(); // Initialize ad network manager
        this.currentLanguage = 'en'; // Default language
        this.timeRemaining = 5; // Initial time for the countdown timer
        this.timerStarted = false; // Flag to check if timer has started
        this.tutTextTween = null; // Tween for tutorial text animation
        this.tutTextBaseScale = 1; // Base scale for tutorial text
        this.button1Clicked = false; // Flag to track if button 1 was clicked
        this.button2Clicked = false; // Flag to track if button 2 was clicked
    }

    create() {
        console.log('%cSCENE::Main', 'color: #fff; background: #ab24f8;')
        
        // Load language data from cache
        this.languageData = this.cache.json.get('languages');
        
        // Fallback language data if not loaded
        if (!this.languageData) {
            console.warn('Language data not loaded. Using fallback.');
            this.languageData = {
                en: {
                    play_now: "PLAY NOW",
                    // ... other fallback texts ...
                }
            };
        }
        
        // Initialize game components
        this.initializeResponsiveDesign();
        this.initializeGameVariables();
        this.createGameObjects();
        this.setupEventListeners();
        this.createUIHand();

        // Listen for orientation changes
        this.scale.on('orientationchange', (orientation) => {
            this.resize();
        });

        // Notify ad network that game ad is loaded
        this.adNetworkManager.loadedGameAd();
    }

    initializeResponsiveDesign() {
        // Set up responsive design variables
        this.gameWidth = this.scale.gameSize.width;
        this.gameHeight = this.scale.gameSize.height;
        this.centerX = this.gameWidth / 2;
        this.centerY = this.gameHeight / 2;
        
        // Determine if the game is in portrait mode (including square viewports)
        this.isPortrait = this.gameHeight >= this.gameWidth;
        
        // Determine device type
        this.deviceType = this.getDeviceType();
        
        // Base scale calculation
        const baseScaleX = this.gameWidth / 639;
        const baseScaleY = this.gameHeight / 639;
        
        // Calculate scaling factor based on device type and orientation
        if (this.deviceType === 'phone') {
            this.scaleFactor = this.isPortrait ? baseScaleX : baseScaleY;
        } else if (this.deviceType === 'tablet') {
            // For tablets, use a more conservative scaling factor
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.8; // 80% of the smaller scale
        } else { // square
            this.scaleFactor = Math.min(baseScaleX, baseScaleY);
        }
        
        // Limit the scale factor to prevent overly large assets
        this.scaleFactor = Math.min(this.scaleFactor, 1.15);
    }

    getDeviceType() {
        const aspectRatio = this.gameWidth / this.gameHeight;
        if (Math.abs(aspectRatio - 1) < 0.1) {
            return 'square';
        } else if (this.gameWidth >= 1080 || this.gameHeight >= 1080) {
            return 'tablet';
        } else {
            return 'phone';
        }
    }

    initializeGameVariables() {
        // Initialize various game state variables
        this.gameStep = 0;
        this.gamePhase = 0;
        this.startGame = false;
        this.firstClick = false;
        this.gameOver = false;
        this.ctaClicked = false;
        this.inactiveTime = 6000;
        this.logoScale = 0.45
        this.ctaScale = 0.45
        this.handAngle = 0
        this.handAngleOpo = 0
    }

    createGameObjects() {
        // Create and position game objects (background, logo, CTA, etc.)
        // Background
        this.bg = this.add.image(this.centerX, this.centerY, "bg");
        this.ecbg = this.add.image(this.centerX, this.centerY, "ecbg");
        this.ecbg.visible = false;
        this.resizeBackground();

        // Logo and CTA
        const topElementsY = 90 * this.scaleFactor;
        this.logo = this.add.image(20, topElementsY, "logo")
            .setScale(this.logoScale * this.scaleFactor)
            .setOrigin(0, 0.5);

        this.CTA = this.add.image(this.gameWidth - 20, topElementsY, "cta")
            .setInteractive()
            .setScale(this.ctaScale * this.scaleFactor)
            .setOrigin(1, 0.5);

        // Add CTA text
        this.ctaText = this.add.bitmapText(this.CTA.x, this.CTA.y, 'gameFont', this.getLocalizedText('play_now'), 72)
            .setOrigin(0.5)
            .setTint(0xFFFFFF)
            .setDepth(21);

        // Immediately update CTA text position and scale
        this.updateCTATextPosition();

        // Tutorial BG
        const tutBGY = this.isPortrait ? 
            topElementsY + 100 * this.scaleFactor : 
            topElementsY;
        this.tutBG = this.add.image(this.centerX, tutBGY, "tutbg")
            .setDepth(10)
            .setScale(this.scaleFactor);
        
        // Add bitmap text to tutBG
        this.tutText = this.add.bitmapText(this.tutBG.x, this.tutBG.y, 'gameFont', this.getLocalizedText('game_tut'), 42)
            .setDepth(11)
            .setOrigin(0.5)
            .setTint(0xFFFFFF);

        this.tutTextBaseScale = this.scaleFactor; // Set the base scale
        this.tutText.setScale(this.tutTextBaseScale);

        // Buttons
        const buttonSpacing = 240 * this.scaleFactor;
        this.uiButton1 = this.add.image(this.centerX - buttonSpacing / 2, this.centerY, 'button')
            .setInteractive()
            .setScale(this.scaleFactor);
        this.uiButton2 = this.add.image(this.centerX + buttonSpacing / 2, this.centerY, 'button')
            .setInteractive()
            .setScale(this.scaleFactor);

        // Legal
        this.legal = this.add.image(this.centerX, this.gameHeight - 35 * this.scaleFactor, "legal")
            .setScale(this.scaleFactor);
        // Disclaimer
        this.disclaimer = this.add.image(this.centerX, this.gameHeight - 20 * this.scaleFactor, "disclaimer")
            .setScale(this.scaleFactor);

        // Overlay for End Card
        this.overlay = this.add.graphics();

        this.startTutTextTween();
    }

    startTutTextTween() {
        // Start the tutorial text tween animation
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

    stopTutTextTween() {
        // Stop the tutorial text tween animation
        if (this.tutTextTween) {
            this.tutTextTween.stop();
            this.tutTextTween = null;
            this.tutText.setScale(this.tutTextBaseScale);
        }
    }

    createUIHand() {
        // Create and set up the UI hand for guiding user interactions
        const handOffset = 120 * this.scaleFactor;
        const x = this.uiButton1.x + handOffset;
        const y = this.uiButton1.y + handOffset;
        
        const uiHand = this.add.image(x, y, 'uihand').setDepth(20).setScale(this.scaleFactor);
        let currentTween = null;
        let targetButton = this.uiButton1;
        let currentAngle = this.handAngle;

        const createTween = () => {
            if (currentTween) currentTween.stop();
            currentTween = this.tweens.add({
                targets: uiHand,
                x: targetButton.x,
                y: targetButton.y,
                ease: 'Sine.easeInOut',
                duration: 500,
                repeat: -1,
                yoyo: true
            });
        };

        const setPosition = (x, y, angle, newTargetButton) => {
            uiHand.setPosition(x, y).setAngle(angle).setAlpha(1);
            if (newTargetButton) targetButton = newTargetButton;
            currentAngle = angle;
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

        const getCurrentState = () => {
            return { targetButton, currentAngle };
        };

        createTween();

        this.uiHandController = { uiHand, setPosition, hide, show, stopTween, resize, getCurrentState };
        
        this.updateUIHandPosition();
    }

    updateUIHandPosition() {
        // Check if we're in the end module state
        if (this.gameOver && this.gamePhase >= 3) {
            // Ensure the UI hand is hidden during the end module
            if (this.uiHandController) {
                this.uiHandController.hide();
            }
            return; // Exit the method early
        }

        // Regular game UI hand positioning
        if (this.uiHandController) {
            const { targetButton, currentAngle } = this.uiHandController.getCurrentState();
            const handOffset = 120 * this.scaleFactor;
            let x, y;

            if (targetButton === this.uiButton1) {
                x = this.uiButton1.x + handOffset;
                y = this.uiButton1.y + handOffset;
            } else {
                x = this.uiButton2.x - handOffset;
                y = this.uiButton2.y + handOffset;
            }

            this.uiHandController.setPosition(x, y, currentAngle, targetButton);
            this.uiHandController.resize(1 * this.scaleFactor);

            // Only show and start tween if we're not in the end module
            if (!this.gameOver) {
                this.uiHandController.show();
            }
        }
    }

    setupEventListeners() {
        // Set up event listeners for user interactions
        this.scale.on('resize', this.resize, this);
        window.addEventListener('resize', () => this.resize());
        
        this.uiButton1.on('pointerdown', () => this.clickButton(this.uiButton1, true));
        this.uiButton2.on('pointerdown', () => this.clickButton(this.uiButton2, false));

        this.input.on('pointerdown', this.handleGlobalClick, this);
        this.CTA.on('pointerdown', this.handleCTAClick, this);
    }

    resize() {
        // Handle game resize events
        this.initializeResponsiveDesign();
        this.resizeBackground();
        this.repositionGameObjects();
        this.updateUIHandPosition();
    }

    resizeBackground() {
        // Resize background images based on orientation
        if (this.isPortrait) {
            this.bg.setDisplaySize(this.gameHeight, this.gameHeight);
            this.ecbg.setDisplaySize(this.gameHeight, this.gameHeight);
        } else {
            this.bg.setDisplaySize(this.gameWidth, this.gameWidth);
            this.ecbg.setDisplaySize(this.gameWidth, this.gameWidth);
        }
    }

    repositionGameObjects() {
        // Reposition game objects after resize
        this.bg.setPosition(this.centerX, this.centerY);
        this.ecbg.setPosition(this.centerX, this.centerY);
        
        if (this.gameOver && this.gamePhase >= 3) {
            // End module layout
            this.repositionEndModuleAssets();
        } else {
            // Regular game layout
            this.repositionRegularGameAssets();
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

    repositionEndModuleAssets() {
        // Reposition assets for end module
        this.logo.setPosition(this.centerX, 200 * this.scaleFactor);
        this.logo.setScale(1 * this.scaleFactor);

        this.CTA.setPosition(this.centerX, (this.gameHeight - 200 * this.scaleFactor));
        this.CTA.setScale(0.85 * this.scaleFactor);

        this.updateCTATextPosition();

        // Resize overlay
        this.overlay.clear();
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);

        // Ensure these elements remain hidden
        this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
        //this.timerBG.setVisible(false);
        //this.timerText.setVisible(false);
    }

    repositionRegularGameAssets() {
        // Regular game layout positioning
        const topElementsY = 90 * this.scaleFactor;

        this.logo.setPosition(20, topElementsY);
        this.logo.setScale(this.logoScale * this.scaleFactor);
        
        this.CTA.setPosition(this.gameWidth - 20, topElementsY);
        this.CTA.setScale(this.ctaScale * this.scaleFactor);
        this.updateCTATextPosition();

        const tutBGY = this.isPortrait ? 
            topElementsY + 100 * this.scaleFactor : 
            topElementsY;
        this.tutBG.setPosition(this.centerX, tutBGY).setScale(this.scaleFactor);
        
        this.tutTextBaseScale = this.scaleFactor;
        this.tutText.setPosition(this.tutBG.x, this.tutBG.y);
        
        if (this.tutTextTween && this.tutTextTween.isPlaying()) {
            this.stopTutTextTween();
            this.startTutTextTween();
        } else {
            this.tutText.setScale(this.tutTextBaseScale);
        }

        const buttonSpacing = 240 * this.scaleFactor;
        this.uiButton1.setPosition(this.centerX - buttonSpacing / 2, this.centerY).setScale(this.scaleFactor);
        this.uiButton2.setPosition(this.centerX + buttonSpacing / 2, this.centerY).setScale(this.scaleFactor);
    }

    updateCTATextPosition() {
        // Update CTA text position and scale
        if (this.ctaText && this.CTA) {
            const ctaCenterX = this.CTA.x - (this.CTA.displayWidth * (-0.5 + this.CTA.originX));
            this.ctaText.setPosition(ctaCenterX, this.CTA.y);
            this.ctaText.setScale(this.CTA.scale * 0.8);
        }
    }

    handleCTAClick() {
        // Handle CTA button click
        if (!this.ctaClicked && !this.gameOver) {
            this.ctaClicked = true;
            this.endGameAd();
            this.clickCTA();
        }
    }

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

    clickButton(button, isButton1) {
        // Handle button click events
        if ((isButton1 && this.button1Clicked) || (!isButton1 && this.button2Clicked)) {
            return; // Exit if the button has already been clicked
        }

        console.log(`click / ${isButton1 ? 'uiButton1' : 'uiButton2'} works`);
        
        if (isButton1) this.button1Clicked = true;
        else this.button2Clicked = true;

        if (!this.firstClick) this.firstClick = true;

        this.tweens.add({
            targets: button,
            scaleX: `-=${0.1 * this.scaleFactor}`,
            scaleY: `-=${0.1 * this.scaleFactor}`,
            ease: 'Sine.easeInOut',
            duration: 200,
            yoyo: true,
            onComplete: () => {
                button.visible = false;
                if ((isButton1 && this.button2Clicked) || (!isButton1 && this.button1Clicked)) {
                    this.gameOver = true;
                    this.gameOverMan();
                } else {
                    // Update UI hand position for the other button
                    const newTargetButton = isButton1 ? this.uiButton2 : this.uiButton1;
                    const handOffset = 120 * this.scaleFactor;
                    const x = isButton1 ? newTargetButton.x - handOffset : newTargetButton.x + handOffset;
                    const y = newTargetButton.y + handOffset;
                    const angle = isButton1 ? this.handAngleOpo : this.handAngle;
                    this.uiHandController.setPosition(x, y, angle, newTargetButton);
                }
            }
        });

        this.removeTweens();
        this.gameStep++;
    }

    removeTweens() {
        // Remove UI hand tweens
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
    }

    inactivityTimer() {
        // Handle inactivity
        if (this.gameOver) {
            this.time.removeEvent(this.inactivityEvent);
        } else {
            if (this.button1Clicked) {
                this.uiHandController.setPosition(this.uiButton2.x - 120, this.uiButton2.y + 100, 395, this.uiButton2);
            } else {
                this.uiHandController.setPosition(this.uiButton1.x + 120, this.uiButton1.y + 100, -395, this.uiButton1);
            }
        }
    }

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
            this.resetInactivityTimer();
            //this.startTimer();
            this.stopTutTextTween();
        } else {
            console.log('click / ui hand reset works!');
            this.removeTweens();
            this.resetInactivityTimer();
        }
    }

    resetInactivityTimer() {
        // Reset the inactivity timer
        this.time.removeEvent(this.inactivityEvent);
        this.inactivityEvent = this.time.addEvent({ delay: this.inactiveTime, callback: this.inactivityTimer, callbackScope: this });
    }

    gameOverMan() {
        // Handle game over state
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
        this.uiButton1.visible = false;
        this.uiButton2.visible = false;
        
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

    endModual() {
        // Set up end module display
        this.overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.bg.visible = false;
        this.ecbg.visible = true;

        this.logo.setOrigin(0.5);
        this.logo.setDepth(20);
        
        this.CTA.setDepth(20);
        this.CTA.setOrigin(0.5);
        
        this.repositionEndModuleAssets();

        // Hide tutorial and timer elements
        this.tutBG.setVisible(false);
        this.tutText.setVisible(false);
    }

    endGameAd() {
        this.adNetworkManager.endGameAd();
    }

    startGameAd() {
        this.adNetworkManager.startGameAd();
    }

    setupCTATween() {
        // Set up CTA button tween animation
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

    getLocalizedText(key) {
        // Get localized text based on current language
        if (this.languageData && this.languageData[this.currentLanguage] && this.languageData[this.currentLanguage][key]) {
            return this.languageData[this.currentLanguage][key];
        }
        return key; // Fallback to key if translation not found
    }

    setLanguage(languageCode) {
        // Set the current language
        if (this.languageData[languageCode]) {
            this.currentLanguage = languageCode;
            this.updateAllText();
        } else {
            console.warn(`Language ${languageCode} not found in language data.`);
        }
    }

    updateAllText() {
        // Update all text elements with new language
        if (this.ctaText) {
            this.ctaText.setText(this.getLocalizedText('play_now'));
            this.updateCTATextPosition();
        }
        // Update other text elements as needed
    }

    transitionEnd() {
        // Handle end of game transition
        // Stop any ongoing game logic
        this.gameOver = true;
        this.removeTweens();

        // Hide tutorial and timer elements
        this.tutBG.setVisible(false);
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
}

// Global functions
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
