'use strict';

/* Controllers */
angular.module('sounddenly.controllers', ['LocalStorageModule'])

/**
 * Home controller
 **/
.controller('HomeCtrl', ['$scope', 'settingsValue', 'settingsFactory', 'playerFactory', function($scope, settingsValue, settingsFactory, playerFactory) {
    $scope.accentColors = settingsValue.colorsCode;
    $scope.backgroundColors = settingsValue.backgroundsCode;
    $scope.audio = {
        source: '',
        loop: false,
    };
    $scope.canvas = {
            barHeight: settingsValue.canvas.barHeight,
            barWidth: settingsValue.canvas.barWidth,
            barSpacing: settingsValue.canvas.barSpacing,
            vibranceMode: settingsValue.canvas.vibranceMode,
        },

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

    $scope.$watch('audio.loop', function(newValue, oldValue) {
        settingsValue.player.loop = newValue;
    });

    $scope.$watch('canvas.barHeight', function(newValue, oldValue) {
        // Should be between 1 and 2
        settingsValue.canvas.barHeight = 2 - newValue;
    });

    $scope.$watch('canvas.barWidth', function(newValue, oldValue) {
        // Should be between 1 and 100
        settingsValue.canvas.barWidth = parseInt(newValue);
    });

    $scope.$watch('canvas.barSpacing', function(newValue, oldValue) {
        // Should be between 1 and 5
        settingsValue.canvas.barSpacing = parseInt(newValue);
    });

    $scope.$watch('canvas.vibranceMode', function(newValue, oldValue) {
        // Should be between 1 and 20
        settingsValue.canvas.vibranceMode = newValue;
    });

    $scope.loadAudio = function() {
        playerFactory.setupAudio(document.querySelector('audio'), $scope.audio.source || 'http://streaming.radionomy.com/MyAudioRadio');
        if (!$scope.audio.source)
        	$scope.audio.source = 'Example with a stream';
    };

    $scope.loadSong = function(element) {
        playerFactory.setupAudio(document.querySelector('audio'), URL.createObjectURL(element.files[0]));
        $scope.audio.source = element.value;
    };

    $scope.loadSample = function() {
        playerFactory.setupAudio(document.querySelector('audio'), 'sounds/loop.mp3');
        $scope.audio.source = '';
    };

    $scope.loadWhiteNoise = function() {
        playerFactory.setupAudio(document.querySelector('audio'), 'sounds/Whitenoisesound.mp3');
        $scope.audio.source = '';
    };

    $scope.loadStream = function() {
        playerFactory.setupAudio(document.querySelector('audio'), 'http://streaming.radionomy.com/BlackLabelFM');
        $scope.audio.source = '';
    };

    $scope.triggerUploadClick = function() {
        document.getElementById('uploadFile').click();
    };
}])

.controller('PlayerCtrl', ['$scope', 'settingsValue', 'playerFactory', 'nodesFactory', function($scope, settingsValue, playerFactory, nodesFactory) {
    var audioSource = document.querySelector('audio');
    nodesFactory.setup(audioSource);
    nodesFactory.setCanvasCtx(document.querySelector('canvas.analyser'));
    nodesFactory.resizeCanvas();

    $scope.audio = {
        volume: playerFactory.getVolume(),
        currentTime: 0,
        durationTime: 0,
        playing: false,
        loaded: false,
        radio: '',
    }

    $scope.play = function() {
        if ($scope.audio.loaded) {
            $scope.audio.playing = !$scope.audio.playing;

            $scope.audio.playing ? audioSource.play() : audioSource.pause();
        }
    };

    $scope.higher = function() {
        $scope.audio.volume = Math.min($scope.audio.volume + 10, 100);
    };

    $scope.lower = function() {
        $scope.audio.volume = Math.max($scope.audio.volume - 10, 0);
    };

    $scope.$watch('audio.volume', function(newValue, oldValue) {
        if ($scope.audio.loaded)
            playerFactory.setVolume(newValue);
    });

    $scope.$watch(function() {
            return settingsValue.player.loop;
        },
        function(newValue, oldValue) {
            audioSource.loop = newValue;
        }, true);

    /**
     * Slider
     **/
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

    audioSource.addEventListener('loadstart', function() {
        // Attempting to load a new song
        $scope.$apply(function() {
            $scope.audio.playing = false;
            $scope.audio.loaded = false;
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
            if (audioSource.duration == 'Infinity' || audioSource.duration === 0) {
                // For stream
                $scope.audio.radio = extractRadioDomain(audioSource.firstElementChild.getAttribute('src'));
                $scope.audio.durationTime = '';
                return;
            }
            if (!isNaN(audioSource.duration)) {
                var duration = audioSource.duration;
                slider.setAttribute('max', duration);
                $scope.audio.radio = '';
                $scope.audio.durationTime = duration.toHHMMSS();
            }
        });
    });

    window.addEventListener("resize", function() {
        nodesFactory.setupAnalyserGradient();
        nodesFactory.resizeCanvas(true);
    });

    $scope.$watch(function() {
            return settingsValue.user.accentColor;
        },
        function(newValue, oldValue) {
            nodesFactory.setupAnalyserGradient();
        }, true);

    $scope.$watch(function() {
            return settingsValue.user.backgroundColor;
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
        max: 4000,
        step: 10,
        cutoff: 10,
        band: [10, 4000]
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
