'use strict';

/* Services */
angular.module('sounddenly.services', [])

	/**
	* Angular services
	**/
	.service('webAudioService', function (soundPlayerService) {
		var sourceNode;
		var gainNode;
		var context = new AudioContext();

		this.setupAudioNodes = function(audioSource) {
		    // Create nodes
		    sourceNode = context.createMediaElementSource(audioSource);
		    gainNode = context.createGain();

		    // Connect nodes
		    sourceNode.connect(gainNode);
		    gainNode.connect(context.destination);
		    sourceNode.loop = false;

		    console.log("Audio Nodes setup");
		}

		this.setVolume = function(volume) {
			//Set the volume value. Should be finite and between 0 and 1
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