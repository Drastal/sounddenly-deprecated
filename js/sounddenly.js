angular.module('sounddenly', [
		'ngRoute',
		'ngAnimate',
		'sounddenly.services',
		'sounddenly.directives',
		'sounddenly.filters',
		'sounddenly.controllers',
		'ngSanitize',
		'LocalStorageModule',
		'snap',
		'ui.bootstrap-slider'
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

	    } catch (e) {
	        alert('Web Audio API is not supported in this browser');
	    }
	})

	.run(function($rootScope, localStorageService) {
		// Set up some user's preferences
	});