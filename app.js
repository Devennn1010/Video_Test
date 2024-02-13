const peer = new Peer();
var localStream;
var startCallButton;
var endCallButton;
navigator.mediaDevices.getUserMedia({ video: true,audio: true })// asking permission for camera, check if working
    .then(stream => {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing media devices:', error);
    });
startCallButton = document.getElementById('startCallButton');
endCallButton = document.getElementById('endCallButton');

startCallButton.addEventListener('click', () => {
    const calleeId = prompt('Enter 2nd User ID:');// Upon clicking call the second user id will be needed
    if (calleeId) {
        const localStream = document.getElementById('localVideo').srcObject;
        const call = peer.call(calleeId, localStream);
        
        call.on('stream', remoteStream => {
            const remoteVideo = document.getElementById('remoteVideo');
            remoteVideo.srcObject = remoteStream;
        });

        endCallButton.disabled = false;
    }
});

endCallButton.addEventListener('click', () => {
    const activeCall = peer.connections[peer.id][0];
    if (activeCall) {
        activeCall.close();
        endCallButton.disabled = true;
    }
});

peer.on('call', call => {
    const localStream = document.getElementById('localVideo').srcObject;
    call.answer(localStream);
    
    call.on('stream', remoteStream => {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = remoteStream;
    });

    endCallButton.disabled = false;
});

// Showing caller ID to be shared with each other
peer.on('open', () => {
    const callerIdElement = document.getElementById('callerId');
    callerIdElement.textContent = peer.id;
});
