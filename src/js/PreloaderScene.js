import Phaser from "phaser";
import MainScene from './MainScene.js';

export default class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.loadMain = false;
        this.countDecodedAudio = 0;
        this.allAudio = 0;
        this.countDecodedTexture = 0;
        this.allTextures = 0;
    }

    preload () {
        console.log('%cSCENE::Preload', 'color: #fff; background: #ff1462;')
        const audioFiles = {
            sound_fx: require('../audio/sound_fx.mp3')
        };
        
        const textureFiles = {
            bg: require('../img/bg.png'),
            logo: require('../img/logo.png'),
            cta: require('../img/cta_blank.png'),
            uihand: require('../img/ui_hand.png'),
            button: require('../img/button.png')
        };

        const atlasFiles = {
            // gameAtlas: {
            //     png: require('../img/game_atlas.png'),
            //     json: require('../img/game_atlas.json')
            // }
        };

        Object.entries(audioFiles).forEach(([key, value]) => this.addAudio(key, value));
        Object.entries(textureFiles).forEach(([key, value]) => this.addTexture(key, value));
        Object.entries(atlasFiles).forEach(([key, {png, json}]) => this.addAtlas(key, png, json));
        
        // Add the game font
        //this.addBitmapText('gameFont', require('../font/gameFont_0.png'), require('../font/gameFont.xml'));

        this.textures.on('onload', this.incrementDecodedTexture, this);
        this.sound.on('decoded', this.incrementDecodedAudio, this);
    }
    
    addBitmapText(key, vPNG, vXML) {
        const pngUrl = this.createBase64Url(vPNG, 'image/png');
        const xmlUrl = this.createBase64Url(vXML, 'application/xml');

        this.load.bitmapFont(key, pngUrl, xmlUrl);

        return this;
    }

    createBase64Url(data, mimeType) {
        // Check if the data is already a data URL
        if (data.startsWith('data:')) {
            return data;
        }
        // If it's not, create a data URL
        return `data:${mimeType};base64,${data}`;
    }

    addAtlas(key, vPNG, vJSON) {
        const pngUrl = this.createBase64Url(vPNG, 'image/png');
        const jsonUrl = this.createBase64Url(vJSON, 'application/json');

        this.load.atlas(key, pngUrl, jsonUrl);

        return this;
    }

    addAudio(key, data) {
        this.allAudio++;
        this.sound.decodeAudio(key, data);
        return this;
    }

    addTexture(key, data) {
        this.allTextures++;
        this.textures.addBase64(key, data);
        return this;
    }

    incrementDecodedTexture = () => this.countDecodedTexture++;
    incrementDecodedAudio = () => this.countDecodedAudio++;

    create() {
        this.loadMain = true;
    }

    update() {
        if (this.loadMain && (this.countDecodedAudio >= this.allAudio) && (this.countDecodedTexture >= this.allTextures)) {
            console.log('%cSCENE::Loaded', 'color: #000; background: #0f0;');
            this.scene.start("Main");
        }
    }
}
