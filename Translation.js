// Initialize PeerJS
const peer = new Peer();

// When PeerJS connection is open
peer.on('open', () => {
    console.log('PeerJS connection open. ID:', peer.id);
});

// Get access to user media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });

// Event listener for "Start Call" button
const startCallButton = document.getElementById('startCallButton');
startCallButton.addEventListener('click', () => {
    const calleeId = prompt('Enter callee ID:');
    if (calleeId) {
        startCall(calleeId);
    }
});

// Event listener for "End Call" button
const endCallButton = document.getElementById('endCallButton');
endCallButton.addEventListener('click', () => {
    endCall();
});

// Function to start a call to callee
function startCall(calleeId) {
    const localStream = document.getElementById('localVideo').srcObject;
    const call = peer.call(calleeId, localStream);

    // Event handler for remote stream
    call.on('stream', remoteStream => {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = remoteStream;
    });

    // Enable "End Call" button
    endCallButton.disabled = false;
}

// Function to end an ongoing call
function endCall() {
    const activeCall = peer.connections[peer.id][0];
    if (activeCall) {
        activeCall.close();
        endCallButton.disabled = true;
    }
}

// Load languages when the page is ready
$(document).ready(function () {
    loadLanguages();
});

// Translate text using Google Cloud Translation API
function translateText(text, sourceLang, targetLang) {
    $.ajax({
        url: "https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text"
        }),
        success: function (response) {
            if (response && response.data && response.data.translations && response.data.translations[0]) {
                const translatedText = response.data.translations[0].translatedText;
                displayTranslatedText(translatedText);
            } else {
                alert("Failed to translate text. Please try again later.");
            }
        },
        error: function () {
            alert("Failed to translate text. Please try again later.");
        }
    });
}

// Function to display translated text as subtitles
function displayTranslatedText(text) {
    const outputText = document.getElementById('outputText');
    outputText.value = text;
}

