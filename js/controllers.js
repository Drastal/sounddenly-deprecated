'use strict';

/* Controllers */
angular.module('sounddenly.controllers', ['LocalStorageModule'])

	/**
	* Home controller
	**/
	.controller('HomeCtrl', function () {
	})

	.controller('AppSettingsCtrl', function ($rootScope, localStorageService) {
		this.backgroundColors = [
			'dark',
			'light'
		];
		this.accentColors = [
			'turquoise',
			'orange',
			'violet',
			'red',
			'blue',
			'green'
		];

		this.backgroundColor = this.backgroundColors.indexOf(localStorageService.get('backgroundColor')) > -1 ? localStorageService.get('backgroundColor') : this.backgroundColors[0];
		localStorageService.set('backgroundColor', this.backgroundColor);

		this.accentColor = this.accentColors.indexOf(localStorageService.get('accentColor')) > -1 ? localStorageService.get('accentColor') : this.accentColors[0];
		localStorageService.set('accentColor', this.accentColor);


		this.update = function(){
			localStorageService.set('backgroundColor', this.backgroundColor);
			localStorageService.set('accentColor', this.accentColor);
			$rootScope.background = localStorageService.get('backgroundColor');
			$rootScope.color = localStorageService.get('accentColor');
		}
	})

	.controller('PlayerCtrl', function (webAudioService, soundPlayerService, localStorageService, $scope) {
		var audioSource = document.querySelector('audio');
		var audioSlider = document.querySelector('#songSlider');

		var playAudio = function() {
			audioSource.play();
        	$scope.playing = true;
        	$scope.$apply();
		};

		var pauseAudio = function() {
			audioSource.pause();
        	$scope.playing = false;
        	$scope.$apply();
		};

		webAudioService.setupAudioNodes(audioSource);

		$scope.playing = false;
		$scope.loaded = false;
		$scope.currentTime = 0;
		$scope.durationTime = 0;

		// Let's apply the previous volume value, or set a new one
		$scope.volume = soundPlayerService.isVolume(localStorageService.get('playerVolume')) ? localStorageService.get('playerVolume') : 70;

		//Initializing slider
		var slider = new Slider('#songSlider', {
			formatter: function(value) {
				return value.toHHMMSS();
			}
		});

		// Triggering seeking event
		slider.on("slideStart", function(newValue) {
			pauseAudio();
			audioSource.currentTime = newValue;
		});

		// Trigering seeking event
		slider.on("slideStop", function(newValue) {
			audioSource.currentTime = newValue;
			playAudio();
		});

		this.play = function(){
			audioSource.paused ? audioSource.play() : audioSource.pause();
			$scope.playing = !$scope.playing;
		};

		this.isMute = function(){
			return $scope.volume == 0 ? true : false;
		};

		this.higher = function() {
			$scope.volume = $scope.volume*1 + 10;

			if($scope.volume > 100){
				$scope.volume = 100;
			}
		}

		this.lower = function() {
			$scope.volume = $scope.volume*1 - 10;

			if($scope.volume < 0){
				$scope.volume = 0;
			}
		}

		$scope.$watch('volume', function(newValue, oldValue) {
			// Let's use an x*x curve (x-squared) since simple linear (x) does not sound as good.
			var volume = Math.round(Math.pow((parseInt(newValue)/100), 2) * 100) / 100;

			webAudioService.setVolume(volume);
			localStorageService.set('playerVolume', newValue); //Store the volume in localStorage
        });

        audioSource.addEventListener('ended', function() {
        	pauseAudio();
        });

        audioSource.addEventListener('canplay', function() {
        	$scope.loaded = true;
        	$scope.$apply();
        });

        audioSource.addEventListener('waiting', function() {
        	$scope.playing = false;
        	$scope.loaded = false;
        	$scope.$apply();
        });

        audioSource.addEventListener('playing', function() {
        	$scope.playing = true;
        	$scope.loaded = true;
        	$scope.$apply();
        });

        audioSource.addEventListener('timeupdate', function() {
        	//update current position in the slider
        	slider.setValue(audioSource.currentTime);
        	$scope.currentTime = audioSource.currentTime.toHHMMSS();
        	$scope.$apply();
        });

        audioSource.addEventListener('durationchange', function() {
        	//update the song duration
        	slider.setAttribute('max', audioSource.duration);
        	$scope.durationTime = audioSource.duration.toHHMMSS();
        	$scope.$apply();
        });
	})

	.controller('AnalyserCtrl', function (webAudioService, $scope, $rootScope) {
		webAudioService.setCanvasCtx(document.querySelector('canvas.analyser'));
		webAudioService.resizeCanvas();

		$scope.$watch('color', function(newValue, oldValue) {
			webAudioService.setupAnalyserGradient(newValue);
        });
	})

	.controller('FilterCtrl', function (webAudioService, $scope) {
		$scope.filterType = 'off';
		$scope.frequencyLow;
		$scope.frequencyHigh;
		$scope.frequencyBand = [];

		$scope.frequency = $scope.frequencyLow;
		$scope.q;

		$scope.setFilterType = function(type) {
		    $scope.filterType = type;
		};

		$scope.isFilterType = function(type) {
		    return type === $scope.filterType;
		};

		$scope.$watch('filterType', function(newValue, oldValue) {
        });

		$scope.$watch('frequencyLow', function(newValue, oldValue) {
			$scope.frequency = $scope.frequencyLow;
        });

		$scope.$watch('frequencyHigh', function(newValue, oldValue) {
			$scope.frequency = $scope.frequencyHigh;
        });

		$scope.$watch('frequencyBand', function(newValue, oldValue) {
			$scope.frequency = ($scope.frequencyBand[0] + $scope.frequencyBand[1]) / 2;
			$scope.q = $scope.frequencyBand[1] - $scope.frequencyBand[0];
        });
	});