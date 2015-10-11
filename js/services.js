'use strict';

/* Services */
angular.module('sounddenly.services', [])

/**
 * Angular services
 **/

/*
.service('soundPlayerService', function() {
    this.play = function(sourceNode, buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0);
    };
})*/

.value('settingsValue', {
    user: {
        accentColor: 'turquoise',
        backgroundColor: 'dark'
    },
    player: {
        audioSrc: '',
        loop: false,
        volume: 70,
        activeFilter: '',
        filter: 'off',
        cutoff: 0,
        q: 0.0001,
    },
    colorsCode: {
        turquoise: '#1abc9c',
        orange: '#d35400',
        blue: '#2980b9',
        green: '#27ae60',
        violet: '#8e44ad',
        red: '#c0392b',
        violet: '#d35400',
    },
    backgroundsCode: {
        dark: '#0B0D0D',
        light: '#ecf0f1',
    },
    filters: ['off', 'lowpass', 'highpass', 'bandpass', 'notch'],
})

.factory('settingsFactory', ['settingsValue', 'localStorageService', function(settingsValue, localStorageService) {
    var settings = {};

    settings.setAccentColor = function(newColor) {
        if (newColor in settingsValue.colorsCode) {
            settingsValue.user.accentColor = newColor;
            localStorageService.set('accentColor', newColor);
        }
    };

    settings.setBackgroundColor = function(newColor) {
        if (newColor in settingsValue.backgroundsCode) {
            settingsValue.user.backgroundColor = newColor;
            localStorageService.set('backgroundColor', newColor);
        }
    };

    settings.getAccentColor = function() {
        return localStorageService.get('accentColor') || settingsValue.user.accentColor;
    };

    settings.getBackgroundColor = function() {
        return localStorageService.get('backgroundColor') || settingsValue.user.backgroundColor;
    };

    return settings;
}])

.factory('playerFactory', ['settingsValue', 'nodesFactory', 'localStorageService', function(settingsValue, nodesFactory, localStorageService) {
    var player = {};

    player.setAudioSource = function(audioSource) {
    	settingsValue.player.audioSource = audioSource.src;
        nodesFactory.setup(audioSource);
    };

    player.setVolume = function(newVolume) {
        // Params : newVolume : integer between 0 and 100
        settingsValue.player.volume = newVolume;
        nodesFactory.setVolume(Math.round(Math.pow((parseInt(newVolume) / 100), 2) * 100) / 100);
    };

    player.getVolume = function() {
        return localStorageService.get('volume') || settingsValue.player.volume;
    };

    return player;
}])

.factory('nodesFactory', ['settingsValue', 'colorsFactory', function(settingsValue, colorsFactory) {
    var nodes = {};

    var audioSource = '';
    var sourceNode;
    var gainNode;
    var analyserNode;
    var filterNode;
    var audioCtx = new AudioContext();

    // Analyser variables
    var bufferLength;
    var dataArray;
    var canvas;
    var canvasCtx;
    var analyserGradient;

    nodes.setup = function(audioSource) {
        // Create nodes
        sourceNode = audioCtx.createMediaElementSource(audioSource);
        gainNode = audioCtx.createGain();
        analyserNode = audioCtx.createAnalyser();
        filterNode = audioCtx.createBiquadFilter();

        // setup an analyser
        analyserNode.fftSize = 256;
        bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Connect nodes
        sourceNode.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        sourceNode.loop = false;
    };

    nodes.destroy = function() {
        sourceNode.disconnect(0);
        gainNode.disconnect(0);
        analyserNode.disconnect(0);
        filterNode.disconnect(0);
    };

    nodes.setVolume = function(volume) {
        //Set the volume value. Should be finite and between 0 and 1
        gainNode.gain.value = volume;
    };

    /**
     * Filter functions
     **/
    nodes.setFilter = function(filterType) {
        if (filterType !== 'off') {
            nodes.connectFilter();
            filterNode.type = filterType;
        } else {
            nodes.disconnectFilter();
        }
    };

    nodes.connectFilter = function() {
        // Insert a filter node
        sourceNode.disconnect(0);
        filterNode.disconnect(0);
        sourceNode.connect(filterNode);
        filterNode.connect(gainNode);
    };

    nodes.disconnectFilter = function() {
        // Remove a filter node
        sourceNode.disconnect(0);
        filterNode.disconnect(0);
        sourceNode.connect(gainNode);
    };

    nodes.setFilterValues = function(frequency, qFactor) {
        settingsValue.player.cutoff = frequency;
        settingsValue.player.q = qFactor;
    	filterNode.frequency.value = frequency;
    	filterNode.Q.value = qFactor;
    }

    /**
     * Analyser functions
     **/
    nodes.setCanvasCtx = function(analyserCanvas) {
        canvas = analyserCanvas;
        canvasCtx = canvas.getContext('2d');
    };

    nodes.resizeCanvas = function() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.width / 4;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        drawAnalyser();
    };

    nodes.setupAnalyserGradient = function() {
        analyserGradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        analyserGradient.addColorStop(1, colorsFactory.code());
        analyserGradient.addColorStop(0, '#fff');
    };

    var drawAnalyser = function() {
        var drawVisual = requestAnimationFrame(drawAnalyser);
        analyserNode.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        var barWidth = (canvas.width / bufferLength) * 1.8;
        var barHeight;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            barHeight = Math.pow((dataArray[i] / analyserNode.fftSize), 3) * canvas.height;

            canvasCtx.fillStyle = analyserGradient;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    };

    return nodes;
}])

.factory('colorsFactory', ['settingsValue', function(settingsValue) {
    var color = {};

    color.code = function(colorName) {
        return settingsValue.colorsCode[settingsValue.user.accentColor] || settingsValue.turquoise;
    };

    return color;
}]);
