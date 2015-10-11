'use strict';

/* Controllers */
angular.module('sounddenly.controllers', ['LocalStorageModule'])

/**
 * Home controller
 **/
.controller('HomeCtrl', ['$scope', 'settingsValue', 'settingsFactory', 'playerFactory', function($scope, settingsValue, settingsFactory, playerFactory) {
    $scope.accentColors = settingsValue.colorsCode;
    $scope.backgroundColors = settingsValue.backgroundsCode;

    $scope.colors = {
        accentColor: settingsFactory.getAccentColor(),
        backgroundColor: settingsFactory.getBackgroundColor(),
    };

    $scope.$watch('colors.accentColor', function(newValue, oldValue) {
        settingsFactory.setAccentColor(newValue);
    });

    $scope.$watch('colors.backgroundColor', function(newValue, oldValue) {
        settingsFactory.setBackgroundColor(newValue);
    });

    $scope.loadAudio = function() {
        var audioSource = {
            element: document.querySelector('audio'),
            audioPath: '',
        }
        audioSource.element.src = audioSource.audioPath || 'sounds/OVPPDC.mp3';
        playerFactory.setAudioSource(audioSource.element);
    };
}])

.controller('PlayerCtrl', ['$scope', 'playerFactory', 'nodesFactory', function($scope, playerFactory, nodesFactory) {
    var audioSource = document.querySelector('audio');
    nodesFactory.setup(audioSource);

    $scope.audio = {
        volume: playerFactory.getVolume(),
        currentTime: 0,
        durationTime: 0,
        playing: false,
        loaded: false,
    }

    $scope.play = function() {
        $scope.audio.playing = !$scope.audio.playing;

        $scope.audio.playing ? audioSource.play() : audioSource.pause();
    };

    $scope.$watch('audio.volume', function(newValue, oldValue) {
        if ($scope.audio.loaded)
            playerFactory.setVolume(newValue);
    });

    $scope.higher = function() {
        $scope.audio.volume = Math.min($scope.audio.volume + 10, 100);
    };

    $scope.lower = function() {
        $scope.audio.volume = Math.max($scope.audio.volume - 10, 0);
    };

    //Initializing slider
    var slider = new Slider('#songSlider', {
        formatter: function(value) {
            return value.toHHMMSS();
        }
    });

    // Triggering seeking event
    slider.on("slideStart", function(newValue) {
        $scope.$apply(function() {
            audioSource.pause();
            audioSource.currentTime = newValue;
        });
    });

    // Trigering seeking event
    slider.on("slideStop", function(newValue) {
        $scope.$apply(function() {
            audioSource.currentTime = newValue;
            audioSource.play();
        });
    });

    audioSource.addEventListener('ended', function() {
        $scope.$apply(function() {
            $scope.audio.playing = false;
        });
    });

    audioSource.addEventListener('canplay', function() {
        // Start to play possible
        $scope.$apply(function() {
            $scope.audio.loaded = true;
        });
    });

    audioSource.addEventListener('waiting', function() {
        // Player stopped, need to buffer the new frame
        $scope.$apply(function() {
            $scope.audio.playing = false;
            $scope.audio.loaded = false;
        });
    });

    audioSource.addEventListener('playing', function() {
        // Continue to play after a pause to buffer
        $scope.$apply(function() {
            $scope.audio.playing = true;
            $scope.audio.loaded = true;
        });
    });

    audioSource.addEventListener('timeupdate', function() {
        $scope.$apply(function() {
            // Update current position in the slider
            var currentTime = audioSource.currentTime;
            slider.setValue(currentTime);
            $scope.audio.currentTime = currentTime.toHHMMSS();
        });
    });

    audioSource.addEventListener('durationchange', function() {
        // Update the song duration
        $scope.$apply(function() {
            var duration = audioSource.duration;
            slider.setAttribute('max', duration);
            $scope.audio.durationTime = duration.toHHMMSS();
        });
    });
}])

.controller('AnalyserCtrl', ['$scope', 'settingsValue', 'nodesFactory', function($scope, settingsValue, nodesFactory) {
    nodesFactory.setCanvasCtx(document.querySelector('canvas.analyser'));
    nodesFactory.resizeCanvas();

    $scope.$watch(function() {
            return settingsValue.user.accentColor;
        },
        function(newValue, oldValue) {
            nodesFactory.setupAnalyserGradient();
        }, true);
}])

.controller('FilterCtrl', ['$scope', 'settingsValue', 'nodesFactory', function($scope, settingsValue, nodesFactory) {
    //filter variables
    $scope.filter = {
        types: settingsValue.filters,
        type: 'off',
        min: 10,
        max: 12500,
        step: 10,
        cutoff: 10,
        band: [10, 12500]
    }

    $scope.$watch('filter.type', function(newValue, oldValue) {
        nodesFactory.setFilter(newValue);

        if (newValue !== 'off' && !$scope.isBandFilter()) {
            nodesFactory.setFilterValues($scope.filter.cutoff, 0.0001);
        } else {
            if ($scope.isBandFilter()) {
                var frequency = ($scope.filter.band[0] + $scope.filter.band[1]) / 2;
                nodesFactory.setFilterValues(frequency, frequency / Math.abs(parseFloat($scope.filter.band[1] - $scope.filter.band[0])));
            }
        }
    });

    $scope.$watch('filter.cutoff', function(newValue, oldValue) {
        if (newValue) {
            nodesFactory.setFilterValues(newValue, 0.0001);
        }
    });

    $scope.$watch('filter.band', function(newValue, oldValue) {
        if (newValue) {
            var frequency = (newValue[0] + newValue[1]) / 2;
            nodesFactory.setFilterValues(frequency, frequency / Math.abs(parseFloat(newValue[1] - newValue[0])));
        }
    });

    $scope.isBandFilter = function() {
        return $scope.filter.type === 'bandpass' || $scope.filter.type === 'notch';
    };
}]);

//var audioSource = $scope.audio.source;
//webAudioService.setAudioSource(audioSource);

/*$rootScope.$watch('changedSrc', function(newValue, oldValue) {
			if(newValue) {
				console.log('changed');
				webAudioService.destroy();
				webAudioService.setAudioSource(audioSource);
				webAudioService.setVolume(Math.round(Math.pow((parseInt($scope.volume)/100), 2) * 100) / 100);
			}
        });*/