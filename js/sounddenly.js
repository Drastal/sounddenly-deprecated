angular.module('sounddenly', [
	'ngRoute',
	'ngAnimate',
	'sounddenly.services',
	'sounddenly.directives',
	'sounddenly.filters',
	'sounddenly.controllers',
	'ngSanitize',
	'LocalStorageModule'
	])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
        .when('/', {controller:'HomeCtrl', templateUrl: 'views/home.html'})
        .otherwise({redirectTo: '/'});
    }])

	.config(['localStorageServiceProvider', function(localStorageServiceProvider){
		localStorageServiceProvider.setPrefix('sounddenly');
	}])

	.run(function() {

	});