 const peer = new Peer();
        var Local_Stream;
        var Begin_Call = document.getElementById('Begin_Call');
        var End_Call_Button = document.getElementById('End_Call_Button');
        var Camera_Button = document.getElementById('Camera_Button');
        var Mute_Button = document.getElementById('Mute_Button');
        var Translate_Button = document.getElementById('Translate_Button');
        const apiKey = 'AIzaSyB144WQqPzNPLeghXUstDGXbVsYz4saeg4'
        let dataConnection; 

        peer.on('open', () => {
            const callerIdElement = document.getElementById('callerId');
            callerIdElement.textContent = peer.id;
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                Local_Stream = stream;
                const Local_Video = document.getElementById('Local_Video');
                Local_Video.srcObject = stream;
            })
            .catch(error => {
                console.error('Error', error);
            });

        Begin_Call.addEventListener('click', () => {
            const calleeId = prompt('Enter 2nd Caller ID:');
            if (calleeId) {
                dataConnection = peer.connect(calleeId);
                const call = peer.call(calleeId, Local_Stream);
                call.on('stream', Remote_Stream => {
                    const Remote_Video = document.getElementById('Remote_Video');
                    Remote_Video.srcObject = Remote_Stream;
                    End_Call_Button.disabled = false;
                });
                End_Call_Button.disabled = false;
            }
        });

        End_Call_Button.addEventListener('click', () => {
            const activeCall = peer.connections[Object.keys(peer.connections)[0]][0];
            if (activeCall) {
                activeCall.close();
                End_Call_Button.disabled = true;
                dataConnection.close(); 
            }
        });

        peer.on('call', call => {
            call.answer(Local_Stream);
            call.on('stream', Remote_Stream => {
                const Remote_Video = document.getElementById('Remote_Video');
                Remote_Video.srcObject = Remote_Stream;
                End_Call_Button.disabled = false;

                const peerConnections = peer.connections[call.peer];
                if (peerConnections && peerConnections.length > 0) {
                    dataConnection = peerConnections[0];
                    dataConnection.on('data', (data) => {
                        const translatedText = data.toString();
                        const chatContainer = document.getElementById('chat-container');
                        const messageElement = document.createElement('div');
                        messageElement.textContent = translatedText;
                        chatContainer.appendChild(messageElement);
                    });
                }
            });
        });

        Camera_Button.addEventListener('click', Camera_ON_OFF);
        Mute_Button.addEventListener('click', Mic_ON_OFF);

        function Camera_ON_OFF() {
            const tracks = Local_Stream.getVideoTracks();
            tracks.forEach(track => {
                track.enabled = !track.enabled;
            });
        }

        function Mic_ON_OFF() {
            const tracks = Local_Stream.getAudioTracks();
            tracks.forEach(track => {
                track.enabled = !track.enabled;
            });
        }

        Translate_Button.addEventListener('click', () => {
            const Source_Language = document.getElementById('Source_Language').value;
            const Target_Language = document.getElementById('Target_Language').value;

            SpeechRecognition(Source_Language, Target_Language);
        });

        function SpeechRecognition(Source_Language, Target_Language) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = Source_Language;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                TranslateText(transcript, Source_Language, Target_Language);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };

            recognition.start();
        }

        function TranslateText(text, sourceLang, targetLang) {
            let url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
            let request = {
                q: text,
                source: sourceLang,
                target: targetLang,
                format: 'text'
            };

            fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to translate text');
                }
                return response.json();
            })
            .then(data => {
                const translatedText = data.data.translations[0].translatedText;
                const chatContainer = document.getElementById('chat-container');
                const messageElement = document.createElement('div');
                messageElement.textContent = translatedText;
                chatContainer.appendChild(messageElement);

                if (dataConnection && dataConnection.open) {
                    dataConnection.send(translatedText);
                }
            })
            .catch(error => {
                console.error('Translation error:', error);
            });
        }
