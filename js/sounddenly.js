angular.module('sounddenly', [
	'ngRoute',
	'ngAnimate',
	'sounddenly.services',
	'sounddenly.directives',
	'sounddenly.filters',
	'sounddenly.controllers',
	'ngSanitize',
	'LocalStorageModule',
	'snap'
	])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
        .when('/', {controller:'HomeCtrl', templateUrl: 'views/home.html'})
        .otherwise({redirectTo: '/'});
    }])

	.config(['localStorageServiceProvider', function(localStorageServiceProvider){
		localStorageServiceProvider.setPrefix('sounddenly');
		localStorageServiceProvider.setNotify(true, true);
	}])

	.config(function() {
	    try {
	        // Fix up for prefixing
	        window.AudioContext = window.AudioContext || window.webkitAudioContext;
			console.log("Audio context created");

	    } catch (e) {
	        alert('Web Audio API is not supported in this browser');
	    }
	})

	.run(function($rootScope, localStorageService) {

		$rootScope.background = localStorageService.get('backgroundColor') ? localStorageService.get('backgroundColor') : 'dark';
		$rootScope.color = localStorageService.get('accentColor') ? localStorageService.get('accentColor') : 'turquoise';

	});