'use strict';

/* Services */
angular.module('sounddenly.services', [])

	/**
	* Angular services
	**/
	.service('webAudioService', function (soundPlayerService) {
		var audioBuffer;
		var sourceNode;
		var gainNode;
		var context = new AudioContext();

		this.setupAudioNodes = function() {
		    // Create nodes
		    sourceNode = context.createBufferSource();
		    gainNode = context.createGain();

		    // Connect nodes
		    sourceNode.connect(gainNode);
		    gainNode.connect(context.destination);
		    sourceNode.loop = false;

		    console.log("Audio Nodes setup");
		}

		// load the specified sound
		this.loadSound = function(url) {
		    var request = new XMLHttpRequest();
		    request.open('GET', url, true);
		    request.responseType = 'arraybuffer';

		    // When loaded decode the data
		    request.onload = function() {

		        // decode the data asynchronously
		        context.decodeAudioData(request.response, function(buffer) {
		            // when the audio is decoded play the sound
		            soundPlayerService.play(sourceNode, buffer);
		        }, function(e) {
				    console.log(e);
				})
		    }
		    request.send();

		    console.log("Sound loaded");
		}

		// load the specified sound
		this.setVolume = function(volume) {
			gainNode.gain.value = volume;
		}
	})

	.service('soundPlayerService', function () {
		this.play = function(sourceNode, buffer) {
		    sourceNode.buffer = buffer;
		    sourceNode.start(0);
		}

		this.isVolume = function(volume) {
			// Check the validity of the volume
			var validVolume = false;
			if(!isNaN(volume)) {
				if(volume >= 0 && volume <= 100) {
					validVolume = true;
				}
			}

			return validVolume;
		}
	});