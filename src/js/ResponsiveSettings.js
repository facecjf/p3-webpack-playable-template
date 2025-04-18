// Change the export syntax
export class ResponsiveSettings {
    constructor(scene) {
        // Store reference to the scene
        this.scene = scene;
        this.initializeResponsiveDesign();
    }

    // Initialize responsive design variables
    initializeResponsiveDesign() {
        // Get dimensions from the scene
        this.gameWidth = this.scene.scale.gameSize.width;
        this.gameHeight = this.scene.scale.gameSize.height;
        this.centerX = this.gameWidth / 2;
        this.centerY = this.gameHeight / 2;
        
        // Determine if the game is in portrait mode
        this.isPortrait = this.gameHeight >= this.gameWidth;
        this.devicePixelRatio = window.devicePixelRatio;
        // Determine device type
        this.deviceType = this.getDeviceType();
        
        // Calculate scaling factors
        const baseScaleX = this.gameWidth / 667;
        const baseScaleY = this.gameHeight / 667;
        
        // Calculate scaling factor based on device type and orientation
        if (this.deviceType === 'phone') {
            this.scaleFactor = this.isPortrait ? baseScaleX : baseScaleY;
        } else if (this.deviceType === 'tablet') {
            this.scaleFactor = Math.min(baseScaleX, baseScaleY) * 0.75;
        } else { // square
            this.scaleFactor = Math.min(baseScaleX, baseScaleY);
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
        const aspectRatio = this.gameWidth / this.gameHeight;
        if (Math.abs(aspectRatio - 1) < 0.1) {
            console.log('square');
            return 'square';
        } else if (this.gameWidth >= 1024 || this.gameHeight >= 1024) {
            console.log('tablet');
            return 'tablet';
        } else {
            console.log('phone');
            return 'phone';
        }
    }
}