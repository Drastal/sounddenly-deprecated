'use strict';

/* Services */
angular.module('sounddenly.services', [])

	/**
	* Angular services
	**/
	.service('webAudioService', function () {
		var sourceNode;
		var gainNode;
		var analyserNode;
		var filterNode;
		var audioCtx = new AudioContext();

		var bufferLength;
		var dataArray;
		var canvas;
		var canvasHeight;
		var canvasWidth;
		var canvasCtx;
		var drawVisual;

		var analyserGradient;

		this.setupAudioNodes = function(audioSource) {
		    // Create nodes
		    sourceNode = audioCtx.createMediaElementSource(audioSource);
		    gainNode = audioCtx.createGain();
        	analyserNode = audioCtx.createAnalyser();
        	filterNode = audioCtx.createBiquadFilter();

		    // setup a analyzer
			analyserNode.fftSize = 256;
			bufferLength = analyserNode.frequencyBinCount;
		    dataArray = new Uint8Array(bufferLength);

		    // Connect nodes
		    sourceNode.connect(gainNode);
		    //filterNode.connect(gainNode);
		    gainNode.connect(analyserNode);
		    analyserNode.connect(audioCtx.destination);
		    sourceNode.loop = false;

		    console.log("Audio Nodes setup");
		}

		this.setVolume = function(volume) {
			//Set the volume value. Should be finite and between 0 and 1
			gainNode.gain.value = volume;
		}

		this.setFilter = function(connectFilter) {
			if(connectFilter){
				sourceNode.connect(filterNode);
				filterNode.connect(gainNode);
			}
			else{
				sourceNode.disconnect(0);
				filterNode.disconnect(0);
				sourceNode.connect(gainNode);
			}
		}

		this.setFilterType = function(filterType) {
			filterNode.type = filterType;
		}

		this.setFilterFrequency = function(filterFrequencies) {

		}

		this.setCanvasCtx = function(analyserCanvas) {
			canvas = analyserCanvas;
			canvasCtx = canvas.getContext('2d');
		}

        this.resizeCanvas = function() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.width/4;
            canvasWidth = canvas.width;
            canvasHeight = canvas.height;
			canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

            drawAnalyser();
        }

        var drawAnalyser = function() {
			drawVisual = requestAnimationFrame(drawAnalyser);
			analyserNode.getByteFrequencyData(dataArray);

    		canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

			var barWidth = (canvasWidth / bufferLength) * 1.8;
			var barHeight;
			var x = 0;

			for(var i = 0; i < bufferLength; i++) {
				barHeight = dataArray[i] * canvasHeight / analyserNode.fftSize;

				canvasCtx.fillStyle = analyserGradient;
				canvasCtx.fillRect(x, canvasHeight-barHeight, barWidth, barHeight);

				x += barWidth + 1;
			}
        }

        this.setupAnalyserGradient = function(color){
        	var accColorCode;

        	switch(color){
        		case 'turquoise':
        			accColorCode = '#1abc9c';
        			break;
        		case 'orange':
        			accColorCode = '#d35400';
        			break;
        		case 'blue':
        			accColorCode = '#2980b9';
        			break;
        		case 'green':
        			accColorCode = '#27ae60';
        			break;
        		case 'violet':
        			accColorCode = '#8e44ad';
        			break;
        		case 'red':
        			accColorCode = '#c0392b';
        			break;
        		case 'violet':
        			accColorCode = '#d35400';
        			break;
        		default:
        			accColorCode = '#1abc9c';
        	}

        	analyserGradient = canvasCtx.createLinearGradient(0, 0, 0, canvasHeight);
			analyserGradient.addColorStop(1, accColorCode);
			analyserGradient.addColorStop(0, '#fff');
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