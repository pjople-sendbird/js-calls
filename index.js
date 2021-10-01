
/**
 * Store the current active call 
 * as a global variable.
 */
var currentCall;

/**
 * Connect to Sendbird Calls
 */
function connect() {    
    // Init Sendbird Calls with your application Id
    SendBirdCall.init( document.getElementById('APP_ID').value );
    // Ask for video and audio permission
    askBrowserPermission();
    // Authorize user
    authorizeUser();
}

/**
 * When this is called, Browser will ask for Audio and Video permission
 */
function askBrowserPermission() {
    SendBirdCall.useMedia({ audio: true, video: true });
}

/**
 * To be able to make and receive calls, a user must be authorized
 */
function authorizeUser() {
    const authOption = { 
        userId: document.getElementById('USER_ID').value,
        accessToken: document.getElementById('ACCESS_TOKEN').value
    };
    SendBirdCall.authenticate(authOption, (res, error) => {
        if (error) {
            console.dir(error);
            alert(`Error authenticating user! Is your Access 
            / Session token correct? This user exists?`);
        } else {
            connectToWebsocket();
        }
    });    
}

/**
 * To be able to make and receive calls, 
 * a user must be connected to Sendbird
 * websockets.
 */
function connectToWebsocket() {
    SendBirdCall.connectWebSocket()
    .then(() => {
        waitForCalls();
    })
    .catch((err) => {
        console.dir(err);
        alert('Failed to connect to Socket server');
    });
}

/**
 * Once connected to websockets,
 * let's wait for calls
 */
function waitForCalls() {
    SendBirdCall.addListener('ANY UNIQUE_HANDLER_ID HERE', {
        onRinging: (call) => {
            /**
             * A call arrived
             */
            call.onEstablished = (call) => {
                currentCall = call;
            };
    
            call.onConnected = (call) => {
                currentCall = call;
            };
    
            call.onEnded = (call) => {
                currentCall = call;
            };
            /**
             * Let's accept this call
             */    
            const acceptParams = {
                callOption: {
                    localMediaView: document.getElementById('local_video_element_id'),
                    remoteMediaView: document.getElementById('remote_video_element_id'),
                    audioEnabled: true,
                    videoEnabled: true
                }
            };    
            call.accept(acceptParams);
        }
    });    
}

/**
 * Make a call to other user
 */
function makeCall() {
    /**
     * Ask user_id to call to
     */
    const userId = prompt("ENTER USER ID TO CALL");
    if (!userId) {
        return;
    }
    /**
     * Set dialing parameters
     */
    const dialParams = {
        userId,
        isVideoCall: true,
        callOption: {
            localMediaView: document.getElementById(
                'local_video_element_id'),
            remoteMediaView: document.getElementById(
                'remote_video_element_id'),
            videoEnabled: true,
            audioEnabled: true
        }
    };
    /**
     * Make the call
     */
    const call = SendBirdCall.dial(dialParams, (call, error) => {
        if (error) {
            console.dir(error);
            alert('Dial Failed!');
        } else {
            console.log('Dial Success');
        }    
    });    
    /**
     * Once the call is established,
     * run this logic
     */
    call.onEstablished = (call) => {
        console.log('onEstablished');
        currentCall = call;  
        // Hide / Show some buttons
        document.getElementById('butMakeCall').style.display = 'none';
        document.getElementById('butEndCall').style.display = 'inline-block';
    };
    /**
     * Once the call is connected,
     * run this logic
     */
    call.onConnected = (call) => {
        console.log('onConnected');
    };
    /**
     * Once the call ended,
     * run this logic
     */
    call.onEnded = (call) => {
        console.log('onEnded');
        currentCall = null;
        // Hide / Show some buttons
        document.getElementById('butMakeCall').style.display = 'inline-block';
        document.getElementById('butEndCall').style.display = 'none';
    };    
    /**
     * Remote user changed audio settings
     * (analysys not covered in this tutorial)
     */
    call.onRemoteAudioSettingsChanged = (call) => {
        console.log('Remote user changed audio settings');
    };    
    /**
     * Remote user changed audio settings
     * (analysys not covered in this tutorial)
     */
     call.onRemoteVideoSettingsChanged = (call) => {
        console.log('Remote user changed video settings');
    };
}

function endCall() {
    if (!currentCall) { return }
    currentCall.end();
}
