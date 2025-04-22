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
                mraid.open(url); 
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
                if (this.isAdVisible && !this.gameStarted) {
                    this.gameStarted = true;
                    console.log('IS: Game started due to ad being visible');
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
                        // 〚1〛 helper so we don’t duplicate the start logic
                        const tryStartGame = () => {
                            if (
                                this.isAdVisible &&          // the ad is on‑screen
                                this.isMraidReady &&         // ‘ready’ event has fired
                                this.isStatePlayable &&      // state is default|expanded
                                !this.gameStarted            // we haven’t started yet
                            ) {
                                this.startGameAd();
                            }
                        };
    
                        // 〚2〛 READY ────────────────
                        this.isMraidReady = false;
                        mraid.addEventListener('ready', () => {
                            console.log('IS: mraid ready');
                            this.isMraidReady = true;
                            tryStartGame();
                        });
    
                        // 〚3〛 STATE CHANGE ─────────
                        this.isStatePlayable = false;
                        const onStateChange = (state) => {
                            this.isStatePlayable = (state === 'default' || state === 'expanded');
                            console.log(`IS: state → ${state}`);
                            tryStartGame();
                        };
                        mraid.addEventListener('stateChange', onStateChange);
    
                        // If mraid is already injected & ready you won’t get a ready
                        // event, so we normalise the current values immediately.
                        if (mraid.getState() !== 'loading') {
                            this.isMraidReady = true;
                            onStateChange(mraid.getState());
                        }
    
                        // 〚4〛 VIEWABILITY ──────────
                        mraid.addEventListener(
                            'viewableChange',
                            this.handleViewableChange.bind(this)
                        );
                        // prime the visibility flag
                        this.isAdVisible = mraid.isViewable();
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

    // Handle viewable change events for Unity & ironsource ads
    handleViewableChange(viewable) {
        if (this.adNetwork !== 'unity' && this.adNetwork !== 'ironsource') return;
        
        this.isAdVisible = viewable;
        
        if (viewable) {
            console.log('Ad became viewable');
            // If the ad becomes viewable, start the game if it hasn't started yet
            if (!this.gameStarted) {
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
