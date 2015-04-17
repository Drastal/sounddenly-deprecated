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

		webAudioService.setupAudioNodes(audioSource);

		$scope.playing = false;

		// Let's apply the previous volume value, or set a new one
		$scope.volume = soundPlayerService.isVolume(localStorageService.get('playerVolume')) ? localStorageService.get('playerVolume') : 70;

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
            }
        );

        audioSource.addEventListener("ended", function() {
        	$scope.playing = !$scope.playing;
        	$scope.$apply();
        });
	});