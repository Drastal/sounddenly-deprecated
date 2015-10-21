'use strict';

/* Services */
angular.module('sounddenly.services', [])

/**
 * Angular services
 **/

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
    canvas: {
        barHeight: 0.8,
        barWidth: 2,
        barSpacing: 5,
        vibranceMode: false,
    },
    colorsCode: {
        blue: '#2980b9',
        green: '#27ae60',
        orange: '#d35400',
        red: '#c0392b',
        turquoise: '#1abc9c',
        violet: '#8e44ad',
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

    player.setupAudio = function(audioSource, url) {
        audioSource.firstElementChild.setAttribute('src', url);
        audioSource.load();
        settingsValue.player.audioSource = url;
        nodesFactory.setup(audioSource);
        player.setVolume();
    };

    player.setVolume = function(newVolume) {
        // Params : newVolume : integer between 0 and 100
        if(newVolume)
            settingsValue.player.volume = newVolume;
        nodesFactory.setVolume(Math.round(Math.pow((parseInt(settingsValue.player.volume) / 100), 2) * 100) / 100);
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
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

    // Analyser variables
    var bufferLength;
    var dataArray;
    var canvas;
    var canvasCtx;
    var analyserGradient;

    var sredHex = "4E";
    var sgrnHex = "5D";
    var sbluHex = "6C";
    var oredHex = "33";
    var ogrnHex = "aa";
    var obluHex = "ff";
    var vibranceMode;
    var barHeight;
    var barWidth;
    var barSpacing;
    var canvasHeight;
    var canvasWidth;

    nodes.setup = function(audioSource) {
        // Create nodes
        if (!sourceNode)
            sourceNode = audioCtx.createMediaElementSource(audioSource);
        if (!gainNode)
            gainNode = audioCtx.createGain();
        if (!analyserNode)
            analyserNode = audioCtx.createAnalyser();
        if (!filterNode)
            filterNode = audioCtx.createBiquadFilter();

        // setup an analyser
        analyserNode.fftSize = 2048;
        bufferLength = analyserNode.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        // Connect nodes
        sourceNode.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        nodes.setFilter();
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
        if(filterType)
            settingsValue.player.filter = filterType;

        if (settingsValue.player.filter !== 'off') {
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
    };

    /**
     * Analyser functions
     **/
    nodes.setCanvasCtx = function(analyserCanvas) {
        canvas = analyserCanvas;
        canvasCtx = canvas.getContext('2d');
    };

    nodes.resizeCanvas = function(drawing) {
        canvasWidth = canvas.offsetWidth;
        canvasHeight = Math.max(document.body.offsetHeight - canvas.getBoundingClientRect().top + document.body.scrollTop - 90, 90); // Fill remaining space (position of canvas element from top of the body, then minus 100px for filters option)
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (!drawing) {
            drawAnalyser();
        }
    };

    nodes.setupAnalyserGradient = function() {
        analyserGradient = canvasCtx.createLinearGradient(0, 0, 0, canvasHeight);
        if (settingsValue.user.backgroundColor === 'dark') {
            analyserGradient.addColorStop(1, '#fff');
            analyserGradient.addColorStop(0, '#fff');

        } else {
            analyserGradient.addColorStop(1, '#777');
            analyserGradient.addColorStop(0, '#777');
        }
        analyserGradient.addColorStop(0.5, colorsFactory.code());
    };

    var drawAnalyser = function() {
        var loud;
        var h;
        vibranceMode = settingsValue.canvas.vibranceMode;
        barHeight = settingsValue.canvas.barHeight;
        barWidth = settingsValue.canvas.barWidth;
        barSpacing = settingsValue.canvas.barSpacing;

        var drawVisual = requestAnimationFrame(drawAnalyser);
        analyserNode.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.fillStyle = analyserGradient;

        for (var i = 0; i < bufferLength; i++) {
            h = (dataArray[i] / 128.0) * canvasHeight / 2;
            loud = Math.abs(dataArray[i]);

            if (vibranceMode && loud > 0) {
                canvas.style.filter = 'brightness(' + (loud / 256 + 1) + ')';
                canvas.style['-webkit-filter'] = 'brightness(' + (loud / 256 + 1) + ')';
            } else {
                canvas.style.filter = '';
                canvas.style['-webkit-filter'] = '';
            }

            canvasCtx.fillStyle = analyserGradient;
            canvasCtx.fillRect(i * (barWidth + barSpacing), canvasHeight / 2 - h / (barHeight * 2), barWidth, h / barHeight);
        }
        /*var drawVisual = requestAnimationFrame(drawAnalyser);
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
        }*/
    };

    return nodes;
}])

.factory('colorsFactory', ['settingsValue', function(settingsValue) {
    var color = {};

    color.code = function() {
        return settingsValue.colorsCode[settingsValue.user.accentColor] || settingsValue.turquoise;
    };

    return color;
}]);
