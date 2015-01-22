var context;
window.addEventListener('load', init, false);

function init() {
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
		console.log("Audio context created");


		var audioBuffer;
		var sourceNode;

		// load the sound
		setupAudioNodes();
		loadSound("sounds/loop.mp3");

    } catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}
function setupAudioNodes() {
    // create a buffer source node
    sourceNode = context.createBufferSource();
    // and connect to destination
    sourceNode.connect(context.destination);
    sourceNode.loop = false;

    console.log("Audio Nodes setup");
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data asynchronously
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();

    console.log("Sound loaded");
}

function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}

// log if an error occurs
function onError(e) {
    console.log(e);
}