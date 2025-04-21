export default class AdNetworkManager {
    constructor() {
        this.adNetwork = process.env.NODE_ENV === 'production' 
            ? (process.env.AD_NETWORK || 'default')
            : 'development';
        this.isAdVisible = false;
        this.gameStarted = false;
        this.isAdReady = false;
        this.isAdLoaded = false;
    }

    clickCTA() {
        switch (this.adNetwork) {
            // Add any specific CTA Click logic here
            case 'development':
                console.log('Development: CTA Clicked');
                break;
            case 'google':
                window.open(window.globalThis.clickTag);
                break;
            case 'ironsource':
                console.log('Ironsource: CTA clicked, opening URL');
                // Use mraid.open with the correct URL
                if (typeof mraid !== 'undefined' && typeof url !== 'undefined') {
                    mraid.open(url);
                } else {
                    console.error('MRAID or URL not defined for click action');
                }
                break;
            case 'facebook':
            case 'moloco':
            case 'tencent':
                FbPlayableAd.onCTAClick();
                break;
            case 'applovin':
            case 'liftoff':
            case 'adcolony':
            case 'chartboost':
                mraid.open();
                break;
            case 'tiktok':
                window.openAppStore();
                break;
            case 'unity':
                mraid.open(url);
                break;
            case 'smadex':
                window.open(window.location.href = '{$CLICK_TRACK_URL$}');
                break;
            case 'mintegral':
                window.gameEnd && window.gameEnd();
                window.gameClose();
                window.install && window.install();
                break;
            case 'vungle':
                parent.postMessage('download', '*');
                break;
            default:
                console.log('Default CTA click');
        }
    }

    endGameAd() {
        switch (this.adNetwork) {
            // Add any specific end game ad logic here
            case 'vungle':
                parent.postMessage('complete', '*');
                console.log('Ad experience has completed');
                break;
            case 'mintegral':
                window.gameEnd && window.gameEnd();
                break;
            default:
                console.log('Default end game ad');
        }
    }

    startGameAd() {
        switch (this.adNetwork) {
            // Add any specific start game ad logic here
            case 'mintegral':
                window.gameStart();
                break;
            case 'ironsource':
                if (this.isAdReady) {
                    console.log('Ironsource: Game starting after MRAID ready');
                    this.gameStarted = true;
                } else {
                    console.log('Ironsource: Waiting for MRAID ready before game can start');
                    // The game will start after mraidReady event
                }
                break;
            case 'unity':
                if (this.isAdVisible && !this.gameStarted) {
                    this.gameStarted = true;
                    console.log('Unity: Game started due to ad being visible');
                }
                break;
            default:
                console.log('Default start game ad');
        }
    }

    loadedGameAd() {
        switch (this.adNetwork) {
            // Add any specific load game ad logic here
            case 'applovin':
                mraid.getState();
                break;
            case 'ironsource':
                if (typeof mraid !== 'undefined') {
                    console.log("Setting up MRAID for IronSource");
                    
                    // Set up the ready event listener first
                    mraid.addEventListener('ready', () => {
                        console.log('MRAID ready event received');
                        this.isAdReady = true;
                        
                        // Dispatch a custom event for the game to listen for
                        const readyEvent = new CustomEvent('mraidReady', { detail: { ready: true } });
                        window.dispatchEvent(readyEvent);
                        
                        // Also set up viewableChange event listener after ready
                        mraid.addEventListener('viewableChange', (isViewable) => {
                            this.isAdVisible = isViewable;
                            console.log('Ironsource: Ad viewable state changed to', isViewable);
                            
                            // Dispatch event for game to handle visibility changes
                            const viewEvent = new CustomEvent('adViewableChange', { 
                                detail: { viewable: isViewable } 
                            });
                            window.dispatchEvent(viewEvent);
                        });
                        
                        // Check initial viewable state
                        if (mraid.isViewable()) {
                            this.isAdVisible = true;
                            console.log('Ironsource: Ad is initially viewable');
                        }
                    });
                    
                    // Check if MRAID is already ready (sometimes this happens before we set listeners)
                    if (mraid.getState() === 'ready') {
                        console.log('MRAID is already in ready state');
                        this.isAdReady = true;
                        
                        // Dispatch a custom event for the game to listen for
                        const readyEvent = new CustomEvent('mraidReady', { detail: { ready: true } });
                        window.dispatchEvent(readyEvent);
                    }
                } else {
                    console.warn('MRAID is not defined, falling back to non-MRAID mode');
                    // For testing environments, simulate MRAID ready
                    setTimeout(() => {
                        this.isAdReady = true;
                        const readyEvent = new CustomEvent('mraidReady', { detail: { ready: true } });
                        window.dispatchEvent(readyEvent);
                    }, 100);
                }
                break;
            case 'mintegral':
                window.gameReady && window.gameReady();
                break;
            case 'unity':
                // Set up viewableChange event listener for Unity ads
                if (typeof mraid !== 'undefined') {
                    mraid.addEventListener('viewableChange', this.handleViewableChange.bind(this));
                    
                    // Check if the ad is already viewable
                    if (mraid.isViewable()) {
                        this.isAdVisible = true;
                        console.log('Unity: Ad is initially viewable');
                    }
                }
                break;
            default:
                console.log('Default loaded game ad');
        }
    }

    // Handle viewable change events for Unity ads
    handleViewableChange(viewable) {
        if (this.adNetwork !== 'unity' && this.adNetwork !== 'ironsource') return;
        
        this.isAdVisible = viewable;
        
        if (viewable) {
            console.log('Ad became viewable');
            // If the ad becomes viewable, start the game if it hasn't started yet
            if (!this.gameStarted && this.isAdReady) {
                this.gameStarted = true;
                this.startGameAd();
            }
            
            // Dispatch a custom event that the game can listen for
            const viewableEvent = new CustomEvent('adViewableChange', { detail: { viewable: true } });
            window.dispatchEvent(viewableEvent);
        } else {
            console.log('Ad is no longer viewable');
            // Dispatch a custom event that the game can listen for to pause gameplay
            const viewableEvent = new CustomEvent('adViewableChange', { detail: { viewable: false } });
            window.dispatchEvent(viewableEvent);
        }
    }
}
