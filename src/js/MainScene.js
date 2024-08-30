import Phaser from "phaser";

// AD NETWORK SPECIFIC FUNCTIONS
    // MINTEGRAL
    // globalThis.gameStart = function () {
    //    parent.postMessage("start","*");
    //    console.log("game started");
    //  } 
    // globalThis.gameClose = function () {
    //    parent.postMessage("complete","*");
    //    console.log("game completed");
    //  }
    // window.gameReady && window.gameReady();

    // APP LOVIN
    // mraid.getState();

    // IRONSOURCE
	//dapi.isReady();
	//dapi.getScreenSize();
	//dapi.isViewable();
	//dapi.getAudioVolume();

    // globalThis.muteGameSound = function () {
    //     scene.sound.setMute(true)
    // }

const items = [];
const objectsArt = [];

// Defines
let uiHandTween
let bg
let overlay
let inactivityEvent

// Vars
let orient = 0
let startX
let startY

let inactiveTime = 6000 // 1000K = 1 sec
let gameStep = 0
let gamePhase = 0

// Booleans
let startGame = false
let firstClick = false
let gameOver = false
let ctaClicked = false
let button1Clicked = false
let button2Clicked = false     

export default class MainScene extends Phaser.Scene {
    constructor () {
        super({ key: 'Main' });
    }
    create() {
        const width_og = this.game.config.width
        const height_og = this.game.config.height
        const width = window.innerWidth
        const height = window.innerHeight
        const camera = this.cameras.main
        const gameScale = this.game.scale
        let scaleFactor = 0
        if (height > width) {
        scaleFactor = Math.min(width / 640, height / 1136);
        } else if (height < width){
        scaleFactor = Math.min(width / 1136, height / 640);
        }

	console.log('%cSTATE::Game', 'color: #fff; background: #ab24f8;');
    
    // CAMERA //
    //camera.centerOn(width_og/2, height_og/2)
    
    // BG //
    bg = this.add.image(width/2, height/2, "bg");
    bg.setScale(1)
    bg.setOrigin(0.5)
    if(height > width) {
        bg.setDisplaySize(height,height)
      } else {
        bg.setDisplaySize(width,width)
      }
    
    // Create buttons
    const createButton = (x, isButton1) => {
        const button = this.add.image(x, height/2, 'button').setInteractive().setScale(scaleFactor);
        
        button.on('pointerdown', function () {
            console.log(`click / ${isButton1 ? 'uiButton1' : 'uiButton2'} works`);
            
            if (isButton1) button1Clicked = true;
            else button2Clicked = true;

            if (!firstClick) firstClick = true;

            // TWEEN
            this.tweens.add({
                targets: button,
                scaleX: `-=${0.1 * scaleFactor}`,
                scaleY: `-=${0.1 * scaleFactor}`,
                ease: 'Sine.easeInOut',
                duration: 200,
                yoyo: true,
                onComplete: () => {
                    button.visible = false;
                    if ((isButton1 && button2Clicked) || (!isButton1 && button1Clicked)) {
                        gameOver = true;
                        gameOverMan();
                    }
                }
            });

            removeTweens(this);
            gameStep++;
        }, this);

        return button;
    };

    // UI BUTTON 1
    const uiButton1 = createButton(bg.x - 120 * scaleFactor, true);

    // UI BUTTON 2
    const uiButton2 = createButton(bg.x + 120 * scaleFactor, false);

    // LOGO //
	const logo = this.add.image(0, 0, "logo");
    logo.setOrigin(0,0.5)

    // CTA //
    const CTA = this.add.image(0, 0, "cta").setInteractive();
      CTA.on("pointerdown", () => {
            // function on CTA click prior to game end
            if(gamePhase < 3) { 
            gameOver = true
            gameOverMan() 
            gamePhase = 3
            }
      })
    CTA.setScale(1*scaleFactor)
    CTA.setOrigin(1,0.5)
   
    // CTA tween
    const CTATween = this.tweens.add({targets: CTA, scaleX: '-=.1*scaleFactor', scaleY: '-=.1*scaleFactor', ease: 'Sine.easeInOut', duration: 450, delay: 0, repeat: -1, paused: true, yoyo: true})
    // CTATween.play()

    // CTA TEXT //
    // const ctaText = this.add.text(0, 0, "PLAY NOW", {
    //     fontFamily: "Arial Black",
    //     fontSize: 32*scaleFactor,
    //     color: "#ffffff",
    //     stroke: "#000000",
    //     strokeThickness: 6*scaleFactor,
    //     align: "center",
    //   })
    // ctaText.setOrigin(0.5);
    
    // const ctaTextTween = this.tweens.add({targets: ctaText, scaleX: '-=.1', scaleY: '-=.1', ease: 'Sine.easeInOut', duration: 450, delay: 0, repeat: -1, paused: false, yoyo: true})
    // ctaTextTween.play()

    // UI HAND (create assets)
    const uiHand = this.add.image(startX, startY, 'uihand').setDepth(20)
    uiHand.setScale(1*scaleFactor)

    // UI HAND / TUTORIAL (on start)
    uiHandTween = this.tweens.add({targets: uiHand, x: uiButton1.x, y: uiButton1.y, ease: 'Sine.easeInOut', duration: 500, delay: 0, repeat: -1, paused: false, yoyo: true})
    uiHandTween.play(this)
    UIhandHelper(uiButton1.x + 120, uiButton1.y + 100, -395)
    
    // ON CLICK (ANY) INTERACTION
    this.input.on('pointerdown', function () {
        // Check first click
        if (gameOver && gamePhase > 2) {
            if(!ctaClicked) {
                ctaClicked = true
                clickCTA()
            } 
        } else if (!firstClick && !gameOver) {
            firstClick = true
            console.log('first click!')
            removeTweens(this)
            // reset ui hand
            this.time.removeEvent(inactivityEvent)
            inactivityEvent = this.time.addEvent({ delay: inactiveTime, callback: inactivityTimer, callbackScope: this })
        } else {
            // reset ui hand
            console.log('click / ui hand reset works!')
            removeTweens(this)
            this.time.removeEvent(inactivityEvent)
            inactivityEvent = this.time.addEvent({ delay: inactiveTime, callback: inactivityTimer, callbackScope: this })
        }
    }, this)
    // Add overlay for End Card
    const overlay = this.add.graphics()

    // Call Asset Placement on start //
    initAssets(this);

    // MINTEGRAL
    // gameStart(this);

    // HANDLERS & FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////
    // ORIENTATION CHANGE HANDLER //
    
    gameScale.on('orientationchange', (Orientation)=> {
      if (Orientation === Phaser.Scale.PORTRAIT) 
      {   
        orient = 0
        console.log('resize port')
      } 
      else if (Orientation === Phaser.Scale.LANDSCAPE) 
      {
        orient = 1
        console.log('resize land')
      }
      // reset ui hand
      //removeTweens(this)
      console.log(orient);
      // this.scene.restart();
    },this)

    // RESIZE LISTENER //
    window.addEventListener("resize", () => {
      // dimension update
      removeTweens(this)
      let nWidth = window.innerWidth
      let nHeight = window.innerHeight
      gameScale.resize(nWidth, nHeight)
      updateAssets()
      this.time.removeEvent(inactivityEvent)
      inactivityEvent = this.time.addEvent({ delay: 500, callback: inactivityTimer, callbackScope: this })
    },true);

    // FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////
    // CTA CLICKED FUNCTION //
    globalThis.clickCTA = function() {
        console.log('CTA Clicked')
        // GOOGLE (dcm & adwords) ~USE THIS
        //window.open(window.globalThis.clickTag);

        // GOOGLE (adwords)
        //ExitApi.exit();

        // IRONSOURCE
        //dapi.openStoreUrl();

        // FACEBOOK / MOLOCO / TENCENT
        //FbPlayableAd.onCTAClick();

        // APPLOVIN / LIFTOFF / ADCOLONY / CHARTBOOST
        //mraid.open();

        // TIKTOK
        //window.openAppStore();

        // UNITY
        //mraid.open(url);

        // MINTEGRAL
        // gameClose(this);
        // window.install && window.install();

        // APPLOVIN / LIFTOFF / ADCOLONY / CHARTBOOST
        //mraid.open();

        // VUNGLE
        // ctaButton.onclick = function(){
        //     parent.postMessage('download','*');
        // };
    }

    // End game Ad network specific functions
    globalThis.endGameAd = function() {
        console.log('End Ad')
        // VUNGLE 
        // function gameCompleted() {
        //     parent.postMessage('complete','*');
        //     console.log('Ad experience has completed');
        // };
        // MINTEGRAL
        // window.gameEnd && window.gameEnd();
    }

    // game over function
    function gameOverMan () {
        uiHand.visible = false
        uiButton1.visible = false
        uiButton2.visible = false
        
        endModual() // EM
        removeTweens()
        //tutMsg.visible = false
        if (!firstClick) {
            gamePhase = gamePhase + 1
            firstClick = true
        } else {
            gamePhase = gamePhase
        }
        console.log(gamePhase)
    }

    // ui hand helper : (set start POS & tween direction with parameters)
    function UIhandHelper (startX, startY, handRot) {
      uiHand.x = startX
      uiHand.y = startY
      uiHand.setAngle(handRot)
      uiHand.alpha = 1
    }

    // tutorial / inactivity helper : removes ui hand
    function removeTweens() {
        uiHand.alpha = 0
        uiHandTween.remove()
    }

    // inactivity function (ui hand / tutorial msgs)
    function inactivityTimer() {
      let cameraWidth = width
      if (gameOver) {
          this.time.removeEvent(inactivityEvent)
      } else {
          //console.log("inactive: Trigger!")
          // position hand based on button choice interaction 
          if(button1Clicked) {
              uiHandTween = this.tweens.add({targets: uiHand, x: uiButton2.x, y: uiButton2.y, ease: 'Sine.easeInOut', duration: 500, delay: 0, repeat: -1, paused: false, yoyo: true})
              uiHandTween.play()
              UIhandHelper(uiButton2.x - 120, uiButton2.y + 100, 395)
          } else {
              uiHandTween = this.tweens.add({targets: uiHand, x: uiButton1.x, y: uiButton1.y, ease: 'Sine.easeInOut', duration: 500, delay: 0, repeat: -1, paused: false, yoyo: true})
              uiHandTween.play()
              UIhandHelper(uiButton1.x + 120, uiButton1.y + 100, -395)
          }
      }
    } 
    
    // Initial asset placement //
    function initAssets() {
      // PORT
      gameScale.setGameSize(width, height) 
      logo.setPosition(20, 90*scaleFactor)
      logo.setScale(0.6*scaleFactor)
      CTA.setPosition(width - 20, 90*scaleFactor)
      CTA.setScale(0.75*scaleFactor)
      uiHand.setScale(1*scaleFactor)
      bg.setPosition(width/2, height/2)
      bg.setOrigin(0.5)
      if(height > width) {
        bg.setDisplaySize(height,height)
      } else {
        bg.setDisplaySize(width,width)
      }
      uiButton1.setPosition(bg.x - 120*scaleFactor, height/2)
      uiButton2.setPosition(bg.x + 120*scaleFactor, height/2)
      gameScale.refresh()
      //console.log("portStart")
    }

    // Update asset placement on resize/orientation change //
    function updateAssets() {
        // dimension update
        let nWidth = window.innerWidth
        let nHeight = window.innerHeight
        //assets
        gameScale.setGameSize(nWidth, nHeight) 
        logo.setPosition(20, 90*scaleFactor)
        logo.setScale(0.6*scaleFactor)
        CTA.setPosition(nWidth - 20, 90*scaleFactor)
        CTA.setScale(0.75*scaleFactor)
        uiHand.setScale(1*scaleFactor)
        bg.setPosition(nWidth/2, nHeight/2)
        bg.setOrigin(0.5)
        if(nHeight > nWidth) {
            bg.setDisplaySize(nHeight,nHeight)
          } else {
            bg.setDisplaySize(nWidth,nWidth)
          }
        uiButton1.setPosition(bg.x - 120*scaleFactor, nHeight/2)
        uiButton2.setPosition(bg.x + 120*scaleFactor, nHeight/2)
        //camera
        camera.setViewport(0,0,nWidth,nHeight)
        camera.setSize(nWidth, nHeight)
        camera.centerOn(nWidth/2, nHeight/2)
        gameScale.refresh()
        //console.log("refresh")
    }

    // end modual function
    function endModual () {
        let nWidth = window.innerWidth
        let nHeight = window.innerHeight
        // OVERLAY
        overlay.fillStyle(0x000000, 0.5).setDepth(15).fillRect(0, 0, 1136*2, 1136*2)
        // EM CTA placement
        logo.setOrigin(0.5)
        logo.setPosition(nWidth/2, 200*scaleFactor)
        logo.setDepth(20)
        CTA.setDepth(20)
        CTA.setOrigin(0.5)
        CTA.setPosition(nWidth/2, (nHeight - 200*scaleFactor))
        CTATween.resume()
        CTATween.timeScale += 1
    }
  } // End Create
  // UPDATE : GAME STATE ///////////////////////////////////////////////////////////////
  update () {
    let startGame = false
    if (gamePhase == 0 && !gameOver) {
        console.log('Phase 1 Tutorial')
        gamePhase++
    } else if (gamePhase == 1 && !gameOver) { // Tutorial Phase ie:1
        if (firstClick) {
            console.log('Phase 2 Start')
            startGame = true
            gamePhase++
        } 
    } else if (gamePhase == 2 && gameOver) { // Game Phase ie:2
            console.log('Phase 3 Game Over EM')
            endGameAd(this)
            gamePhase++
    } else if (gamePhase == 3 && gameOver) { // End Modal Phase ie:3
        if (ctaClicked) {
            console.log('Phase 4 Return Modual')
            //returnModual() // call RM
            gamePhase++
        }
    } else { // Return Modal Phase ie:4
        //console.log('Return Modual')
    }
  } 
  // END UPDATE ////////////////////////////////////////////////////////////////////// 
}
