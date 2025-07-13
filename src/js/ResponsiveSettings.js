// Change the export syntax
export class ResponsiveSettings {
    constructor(scene) {
        // Store reference to the scene
        this.scene = scene;
        this.initializeResponsiveDesign();
    }

    checkOriention (orientation)
    {
        if (orientation === Phaser.Scale.PORTRAIT)
        {
            console.log('Portrait');
        }
        else if (orientation === Phaser.Scale.LANDSCAPE)
        {
            console.log('Landscape');
        }
    }

    // Initialize responsive design variables
    initializeResponsiveDesign() {
        this.checkOriention(this.scene.scale.orientation);
        // Get dimensions from the scene
        this.gameWidth = this.scene.scale.width;
        this.gameHeight = this.scene.scale.height;
        this.centerX = this.gameWidth * 0.5;
        this.centerY = this.gameHeight * 0.5;
        
        // Determine device type
        this.deviceType = this.getDeviceType();

        // Determine if the game is in portrait mode (including square viewports)
        this.isPortrait = this.gameHeight >= this.gameWidth;
        this.isLandscape = this.gameWidth > this.gameHeight;
        // this.isSquare = this.gameWidth === this.gameHeight || this.gameWidth === this.gameHeight;
        // this.isLandscape = this.gameWidth > this.gameHeight;
        
        // Calculate scaling factors
        const baseScaleX = this.gameWidth / 768;
        const baseScaleY = this.gameHeight / 768;
        
        // Calculate scaling factor based on device type and orientation
        if (this.deviceType === 'phone') {
            this.scaleFactor = this.isPortrait ? baseScaleX : baseScaleY;
        } else if (this.deviceType === 'tablet') {
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.85;
        } else if (this.deviceType === 'smallPhone') {
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.85;
        } else { // square
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.5;
        }
        
        // Limit the scale factor
        this.scaleFactor = Math.min(this.scaleFactor, 1);

        // Set up positional references
        this.gameTop = 0;
        this.gameBottom = this.gameHeight;
        this.gameRight = this.gameWidth;
        this.gameLeft = 0;

        return this;
    }

    getDeviceType() {
        const aspectRatio = this.isPortrait ? this.gameWidth / this.gameHeight : this.gameHeight / this.gameWidth;
        if (Math.abs(aspectRatio - 1) < 0.1) {
            console.log('Device: square');
            return 'square';
        } else if ((this.gameWidth >= 712 && this.gameHeight >= 1024) || (this.gameWidth >= 1024 && this.gameHeight >= 712)) {
            console.log('Device: tablet');
            return 'tablet';
        } else if (this.gameWidth <= 320 && this.gameHeight <= 480) {
            console.log('Device: smallPhone');
            return 'smallPhone';
        } else {
            console.log('Device: phone');
            return 'phone';
        }
    }
}
