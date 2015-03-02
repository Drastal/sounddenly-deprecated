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

	.controller('PlayerCtrl', function () {
		this.playing = false;
		this.volume = 70;

		this.play = function(){
			this.playing = !this.playing;
		};

		this.isMute = function(){
			return this.volume == 0 ? true : false;
		};

		this.higher = function() {
			this.volume = this.volume*1 + 15;

			if(this.volume > 100){
				this.volume = 100;
			}
		}

		this.lower = function() {
			this.volume = this.volume*1 - 15;

			if(this.volume < 0){
				this.volume = 0;
			}
		}
	});