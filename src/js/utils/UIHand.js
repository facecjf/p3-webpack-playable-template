export default class UIHand {
    constructor(scene) {
        this.scene = scene;
        this.uiHand = null;
        this.uiHandStartX = this.scene.uiHandStartX;
        this.uiHandStartY = this.scene.uiHandStartY;
        this.uiHandEndX = this.scene.uiHandEndX;
        this.uiHandEndY = this.scene.uiHandEndY;
        this.scaleFactor = 0;
        this.handAngle = 0;
        this.handAngleOpo = 0;
        this.uiHandController = null;
    }

    setPosition(uiHandStartX, uiHandStartY, uiHandEndX, uiHandEndY) {
        this.uiHandStartX = uiHandStartX;
        this.uiHandStartY = uiHandStartY;
        this.uiHandEndX = uiHandEndX;
        this.uiHandEndY = uiHandEndY;
    }
     // Create and set up the UI hand for guiding user interactions
     createUIHand() {
        const uiHand = this.scene.add.image(this.uiHandStartX, this.uiHandStartY, 'uihand')
                .setDepth(20)
                .setScale(this.scene.scaleFactor);
            
            let currentTween = null;
    
            const createTween = () => {
                if (currentTween) currentTween.stop();
                currentTween = this.scene.tweens.add({
                    targets: uiHand,
                    x: this.uiHandEndX,
                    y: this.uiHandEndY,
                    ease: 'Sine.easeInOut',
                    duration: 1000,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween, target) => {
                        // No extra work needed, Phaser handles the delta time internally
                    }
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
                this.uiHandController.resize(this.scene.scaleFactor);
    
                if (!this.gameOver) {
                    this.uiHandController.show();
                }
            }
        }

        // Remove UI hand tweens
    removeUIHandTweens() {
        if (this.uiHandController) {
            this.uiHandController.hide();
            this.uiHandController.stopTween();
        }
    }
}